const prisma = require('../config/prisma');
const db = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'dummy_key_to_prevent_crash');

/**
 * Hàm hỗ trợ gộp các sản phẩm giống nhau (cùng tên, màu, dung lượng)
 */
const groupIdenticalItems = (items) => {
  return Object.values(items.reduce((acc, item) => {
    const key = `${item.productName}_${item.selectedColor || ''}_${item.selectedStorage || ''}`;
    if (acc[key]) {
      acc[key].quantity += (item.quantity || 1);
    } else {
      acc[key] = { ...item, quantity: item.quantity || 1 };
    }
    return acc;
  }, {}));
};

/**
 * Lấy danh sách đơn hàng
 */
const getOrders = async (req, res) => {
  try {
    let whereClause = {};

    // Khách hàng chỉ xem được đơn của chính mình
    if (req.user.role === 'customer') {
      whereClause.userId = req.user.id;
    } else {
      // Admin, Manager, Sales có thể lọc theo userId
      if (req.query.userId) {
        whereClause.userId = req.query.userId;
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { fullName: true, email: true, phone: true } },
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map dữ liệu cho giống với cấu trúc frontend hiện tại (items)
    const formattedOrders = orders.map(o => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      items: o.orderItems.map(item => ({
        ...item,
        price: Number(item.price)
      }))
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng (Prisma):', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

/**
 * Tạo Checkout Session Stripe thay cho tạo đơn cứng
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng trống' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Chưa cấu hình Stripe Secret Key trong .env' });
    }

    const groupedItems = groupIdenticalItems(items);

    const lineItems = groupedItems.map(item => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.productName || 'Sản phẩm Apple',
          description: `Màu: ${item.selectedColor || 'Mặc định'} - Dung lượng: ${item.selectedStorage || 'Mặc định'}`,
        },
        unit_amount: Math.round(Number(item.price)),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl || 'http://localhost:5173/orders?checkout=success',
      cancel_url: cancelUrl || 'http://localhost:5173/cart?checkout=canceled',
      client_reference_id: userId || 'guest',
      metadata: {
        items: JSON.stringify(groupedItems.map(i => ({ name: i.productName, price: i.price, qty: i.quantity })))
      }
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Lỗi Stripe Checkout:', error);
    res.status(500).json({ error: 'Lỗi khi tạo phiên thanh toán' });
  }
};

const isUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const getValidCustomerUserId = async (id) => {
  if (!id || !isUUID(id)) return null;
  try {
    const res = await db.query('SELECT id FROM customer.users WHERE id = $1', [id]);
    return res.rows.length > 0 ? id : null;
  } catch (e) {
    return null;
  }
};

/**
 * Tạo Đơn Hàng
 */
const createOrder = async (req, res) => {
  try {
    const { 
      userId, paymentMethod, notes, totalAmount, items, fullName, phone, shippingAddress 
    } = req.body;

    const rawUserId = userId || (req.user ? req.user.id : null);
    const validUserId = await getValidCustomerUserId(rawUserId);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu đơn hàng không hợp lệ' });
    }

    const groupedItems = groupIdenticalItems(items);

    // Prisma Transaction
    const newOrder = await prisma.order.create({
      data: {
        userId: validUserId,
        totalAmount: totalAmount,
        orderStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: paymentMethod || 'COD',
        cancelReason: notes,
        fullName: fullName || null,
        phone: phone || null,
        shippingAddress: shippingAddress || null,
        orderItems: {
          create: groupedItems.map(item => ({
            productName: item.productName || 'Unknown Product',
            selectedColor: item.selectedColor,
            selectedStorage: item.selectedStorage,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image
          }))
        }
      }
    });

    // --- SOCKET.IO EMIT ---
    if (req.io) {
      req.io.emit('new_order', {
        message: 'Có đơn hàng mới!',
        orderId: newOrder.id,
        customer: newOrder.fullName || 'Khách hàng'
      });
    }

    res.status(201).json({ message: 'Tạo đơn hàng thành công', orderId: newOrder.id });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng (Prisma):', error);
    res.status(500).json({ 
      error: 'Lỗi server khi tạo đơn hàng', 
      details: error.message,
      meta: error.meta 
    });
  }
};

/**
 * Hủy đơn hàng (Cancel Order)
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;

    if (!cancelReason) return res.status(400).json({ error: 'Vui lòng cung cấp lý do.' });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn.' });
    if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'PROCESSING') {
      return res.status(400).json({ error: 'Đơn hàng đang giao, không thể hủy.' });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: 'CANCELLED', cancelReason }
    });

    // --- SOCKET.IO EMIT ---
    if (req.io) {
      req.io.emit('order_status_update', {
        orderId: cancelledOrder.id,
        status: 'CANCELLED'
      });
    }

    res.status(200).json({ message: 'Đã hủy', order: cancelledOrder });
  } catch (error) {
    console.error('Lỗi khi hủy đơn hàng:', error);
    res.status(500).json({ error: 'Lỗi server khi hủy đơn.' });
  }
};

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status }
    });

    // --- SOCKET.IO EMIT ---
    if (req.io) {
      req.io.emit('order_status_update', {
        orderId: updatedOrder.id,
        status
      });
    }

    res.status(200).json({ message: 'Đã cập nhật', order: updatedOrder });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái.' });
  }
};

/**
 * VNPAY Webhook (IPN)
 */
const vnpayWebhook = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isValidSignature = true;
    
    if (isValidSignature) {
      const orderId = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const transactionId = vnp_Params['vnp_TransactionNo'];
      
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return res.status(404).json({ RspCode: '01', Message: 'Order not found' });
      
      if (order.paymentStatus === 'PAID') {
        return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
      }

      if (responseCode === '00') {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID', transactionId }
        });
        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED', transactionId }
        });
        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success but Payment Failed' });
      }
    } else {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Lỗi VNPAY Webhook:', error);
    res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
  }
};

/**
 * Chuyển đổi phương thức thanh toán sang COD
 */
const switchToCOD = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    
    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Đơn hàng đã được thanh toán, không thể chuyển sang COD.' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod: 'COD' }
    });

    res.status(200).json({ message: 'Đã chuyển sang thanh toán COD', order: updatedOrder });
  } catch (error) {
    console.error('Lỗi khi chuyển sang COD:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật phương thức thanh toán.' });
  }
};

module.exports = {
  getOrders,
  createCheckoutSession,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  vnpayWebhook,
  switchToCOD
};
