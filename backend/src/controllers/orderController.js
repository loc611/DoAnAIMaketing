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

    const crmRoleHeader = req.headers['x-crm-role'];
    const isCrmRequest = Boolean(crmRoleHeader);
    const userRole = (req.user?.role || '').toUpperCase();
    const isPrivilegedRole = ['SUPER_ADMIN', 'ADMIN', 'SALES', 'MANAGER', 'SALES_STAFF', 'WAREHOUSE_STAFF'].includes(userRole);

    // Nếu request từ CRM (có x-crm-role) và có quyền quản trị: cho phép xem toàn bộ hoặc lọc theo req.query.userId
    if (isCrmRequest && isPrivilegedRole) {
      if (req.query.userId) {
        whereClause.userId = req.query.userId;
      }
    } else {
      // Giao diện Storefront của khách hàng: Phân lập theo tài khoản đang đăng nhập (khớp userId hoặc SĐT)
      if (req.user && req.user.id) {
        const conditions = [{ userId: req.user.id }];
        if (req.user.phone && typeof req.user.phone === 'string' && req.user.phone.trim().length >= 8) {
          conditions.push({ phone: req.user.phone.trim() });
        }
        whereClause = conditions.length > 1 ? { OR: conditions } : { userId: req.user.id };
      } else {
        // Không có tài khoản đăng nhập -> không trả về đơn hàng của người khác
        return res.status(200).json([]);
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Lấy thông tin user từ customer.users, sales.staff hoặc admin.users
    const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))];
    let userMap = {};
    if (userIds.length > 0) {
      try {
        const userRes = await db.query(
          `SELECT id, fullName, email, phone FROM customer.users WHERE id = ANY($1::uuid[])
           UNION ALL
           SELECT id, fullName, email, phone FROM sales.staff WHERE id = ANY($1::uuid[])
           UNION ALL
           SELECT id, fullName, email, phone FROM admin.users WHERE id = ANY($1::uuid[])`,
          [userIds]
        );
        userRes.rows.forEach(u => {
          userMap[u.id] = { fullName: u.fullname || u.fullName, email: u.email, phone: u.phone };
        });
      } catch (err) {
        console.warn('Lỗi khi truy vấn thông tin user cho orders:', err.message);
      }
    }

    // Map dữ liệu cho giống với cấu trúc frontend hiện tại (items)
    const formattedOrders = orders.map(o => ({
      ...o,
      user: o.userId ? userMap[o.userId] || null : null,
      totalAmount: Number(o.totalAmount),
      discountAmount: Number(o.discountAmount || 0),
      promotionCode: o.promotionCode || null,
      items: (o.orderItems || []).map(item => ({
        ...item,
        price: Number(item.price)
      }))
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng (Prisma):', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
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

const getValidUserId = async (id) => {
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
      userId, paymentMethod, notes, totalAmount, items, fullName, phone, shippingAddress,
      promotionCode, discountAmount 
    } = req.body;

    const rawUserId = (req.user && req.user.id) ? req.user.id : userId;
    const validUserId = await getValidUserId(rawUserId);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu đơn hàng không hợp lệ' });
    }

    const groupedItems = groupIdenticalItems(items);

    // Prisma Transaction
    const newOrder = await prisma.order.create({
      data: {
        userId: validUserId,
        totalAmount: totalAmount,
        discountAmount: discountAmount ? Number(discountAmount) : 0,
        promotionCode: promotionCode ? String(promotionCode).trim().toUpperCase() : null,
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

    // Nếu có mã khuyến mãi, tăng số lượt đã sử dụng (usedCount)
    if (promotionCode) {
      try {
        const cleanPromo = String(promotionCode).trim().toUpperCase();
        await prisma.promotion.updateMany({
          where: { code: cleanPromo },
          data: { usedCount: { increment: 1 } }
        });
      } catch (promoErr) {
        console.warn('Lỗi khi tăng usedCount cho mã khuyến mãi:', promoErr.message);
      }
    }

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

    // Kiểm tra quyền hủy:
    // Nếu có x-crm-role và là nhân viên/admin thì có quyền hủy bất kỳ đơn nào
    // Nếu là người dùng trên Storefront, bắt buộc phải là chủ sở hữu của đơn
    const crmRoleHeader = req.headers['x-crm-role'];
    const userRole = (req.user?.role || '').toUpperCase();
    const isPrivilegedRole = ['SUPER_ADMIN', 'ADMIN', 'SALES', 'MANAGER', 'SALES_STAFF'].includes(userRole);

    if (!crmRoleHeader || !isPrivilegedRole) {
      if (!req.user || req.user.id !== order.userId) {
        return res.status(403).json({ error: 'Bạn không có quyền hủy đơn hàng này.' });
      }
    }

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
 * Lấy thông tin trạng thái đơn hàng theo ID
 */
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }

    let userInfo = null;
    if (order.userId) {
      try {
        const uRes = await db.query(
          `SELECT id, fullName, email, phone FROM customer.users WHERE id = $1
           UNION ALL
           SELECT id, fullName, email, phone FROM sales.staff WHERE id = $1
           UNION ALL
           SELECT id, fullName, email, phone FROM admin.users WHERE id = $1
           LIMIT 1`,
          [order.userId]
        );
        if (uRes.rows.length > 0) {
          const row = uRes.rows[0];
          userInfo = {
            fullName: row.fullname || row.fullName,
            email: row.email,
            phone: row.phone
          };
        }
      } catch (e) {
        console.warn('Lỗi lấy user cho getOrderStatus:', e.message);
      }
    }

    res.status(200).json({
      id: order.id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      fullName: order.fullName || userInfo?.fullName || null,
      phone: order.phone || userInfo?.phone || null,
      shippingAddress: order.shippingAddress,
      cancelReason: order.cancelReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: userInfo,
      items: (order.orderItems || []).map(item => ({
        ...item,
        price: Number(item.price)
      }))
    });
  } catch (error) {
    console.error('Lỗi khi lấy trạng thái đơn hàng:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy trạng thái đơn hàng.', details: error.message });
  }
};

/**
 * Cập nhật trạng thái đơn hàng (Admin, Manager, Sales, Warehouse)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus, cancelReason, assignedStaffId } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ.' });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }

    const updateData = {};
    if (status) updateData.orderStatus = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;
    if (assignedStaffId !== undefined) updateData.assignedStaffId = assignedStaffId;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: true
      }
    });

    let userInfo = null;
    if (updatedOrder.userId) {
      try {
        const uRes = await db.query(
          `SELECT id, fullName, email, phone FROM customer.users WHERE id = $1
           UNION ALL
           SELECT id, fullName, email, phone FROM admin.users WHERE id = $1
           LIMIT 1`,
          [updatedOrder.userId]
        );
        if (uRes.rows.length > 0) {
          const row = uRes.rows[0];
          userInfo = {
            fullName: row.fullname || row.fullName,
            email: row.email,
            phone: row.phone
          };
        }
      } catch (e) {
        console.warn('Lỗi lấy user cho updateOrderStatus:', e.message);
      }
    }

    // --- SOCKET.IO EMIT ---
    if (req.io) {
      req.io.emit('order_status_update', {
        orderId: updatedOrder.id,
        status: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus
      });
    }

    res.status(200).json({ 
      message: 'Cập nhật đơn hàng thành công', 
      order: {
        ...updatedOrder,
        user: userInfo,
        totalAmount: Number(updatedOrder.totalAmount),
        items: (updatedOrder.orderItems || []).map(item => ({
          ...item,
          price: Number(item.price)
        }))
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật trạng thái.', details: error.message });
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
  getOrderStatus,
  createCheckoutSession,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  vnpayWebhook,
  switchToCOD
};
