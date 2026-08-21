const prisma = require('../config/prisma');
const db = require('../config/db');

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

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const validUserId = await getValidCustomerUserId(userId);

    if (!validUserId) {
      // Tài khoản không thuộc customer.users (Admin/Staff hoặc vãng lai) -> trả về giỏ hàng rỗng
      return res.json({ id: null, userId: null, items: [] });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: validUserId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: validUserId },
        include: { items: true }
      });
    }

    // Chuyển đổi định dạng Decimal của Prisma sang số thực và map đúng key cho frontend
    const formattedItems = (cart.items || []).map(item => ({
      ...item,
      id: item.productId,
      name: item.productName,
      color: item.selectedColor,
      storage: item.selectedStorage,
      price: parseFloat(item.price)
    }));

    res.json({ ...cart, items: formattedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Lỗi khi lấy giỏ hàng' });
  }
};

// Đồng bộ toàn bộ giỏ hàng
const syncCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ, items phải là mảng' });
    }

    const validUserId = await getValidCustomerUserId(userId);
    if (!validUserId) {
      // Nếu không phải customer trong DB, chấp nhận dữ liệu giỏ hàng local và trả về thành công
      const formattedItems = items.map(item => ({
        ...item,
        id: item.id || item.productId,
        name: item.name || item.productName,
        color: item.color || item.selectedColor,
        storage: item.storage || item.selectedStorage,
        price: parseFloat(item.price || 0)
      }));
      return res.json({ 
        message: 'Đồng bộ giỏ hàng local thành công', 
        cart: { id: null, userId: null, items: formattedItems } 
      });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: validUserId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: validUserId }
      });
    }

    // Xoá tất cả items cũ của cart này
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Thêm các items mới
    if (items.length > 0) {
      const itemsToCreate = items.map(item => ({
        cartId: cart.id,
        productId: item.id || item.productId || 'UNKNOWN_PRODUCT',
        productName: item.name || item.productName || 'Sản phẩm',
        selectedColor: item.color || item.selectedColor || null,
        selectedStorage: item.storage || item.selectedStorage || null,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null
      }));

      await prisma.cartItem.createMany({
        data: itemsToCreate
      });
    }

    // Lấy lại giỏ hàng sau khi cập nhật
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: validUserId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const formattedItems = (updatedCart?.items || []).map(item => ({
      ...item,
      id: item.productId,
      name: item.productName,
      color: item.selectedColor,
      storage: item.selectedStorage,
      price: parseFloat(item.price)
    }));

    res.json({ message: 'Đồng bộ giỏ hàng thành công', cart: { ...updatedCart, items: formattedItems } });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ error: 'Lỗi khi đồng bộ giỏ hàng' });
  }
};

module.exports = {
  getCart,
  syncCart
};
