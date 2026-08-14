const { prisma } = require('../../models/db.service');

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      });
    }

    // Chuyển đổi định dạng Decimal của Prisma sang số thực và map đúng key cho frontend
    const formattedItems = cart.items.map(item => ({
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
    const userId = req.user.id;
    const { items } = req.body; // Mảng các cart items từ frontend

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ, items phải là mảng' });
    }

    // Đảm bảo user đã có cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
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
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const formattedItems = updatedCart.items.map(item => ({
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
