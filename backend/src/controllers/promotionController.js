const prisma = require('../config/prisma');

/**
 * Lấy danh sách các mã khuyến mãi đang khả dụng cho khách hàng (Storefront Checkout)
 */
const getAvailablePromotions = async (req, res) => {
  try {
    const now = new Date();
    
    // Lấy các mã active, còn hạn và còn lượt dùng
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Lọc bỏ những mã đã hết lượt dùng
    const available = promotions.filter(p => p.usageLimit === null || p.usedCount < p.usageLimit);

    const formatted = available.map(p => ({
      id: p.id,
      code: p.code,
      title: p.title || p.code,
      description: p.description,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : null,
      minOrderValue: Number(p.minOrderValue || 0),
      validUntil: p.validUntil,
      usageLimit: p.usageLimit,
      usedCount: p.usedCount
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khuyến mãi khả dụng:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

/**
 * Kiểm tra và tính toán giá trị giảm của mã khuyến mãi (Storefront Checkout)
 */
const validatePromotion = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Vui lòng nhập mã khuyến mãi.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderTotal = Number(totalAmount) || 0;

    const promo = await prisma.promotion.findUnique({
      where: { code: cleanCode }
    });

    if (!promo || !promo.isActive) {
      return res.status(404).json({ error: 'Mã khuyến mãi không tồn tại hoặc đã ngừng áp dụng.' });
    }

    const now = new Date();
    if (promo.validFrom && new Date(promo.validFrom) > now) {
      return res.status(400).json({ error: 'Chương trình khuyến mãi chưa bắt đầu.' });
    }

    if (promo.validUntil && new Date(promo.validUntil) < now) {
      return res.status(400).json({ error: 'Mã khuyến mãi đã hết hạn sử dụng.' });
    }

    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ error: 'Mã khuyến mãi đã hết lượt sử dụng.' });
    }

    const minOrder = Number(promo.minOrderValue || 0);
    if (orderTotal < minOrder) {
      return res.status(400).json({ 
        error: `Đơn hàng tối thiểu phải từ ${minOrder.toLocaleString('vi-VN')}đ để áp dụng mã này.` 
      });
    }

    // Tính toán số tiền được giảm
    let discountAmount = 0;
    const discountVal = Number(promo.discountValue);

    if (promo.discountType === 'PERCENT') {
      discountAmount = (orderTotal * discountVal) / 100;
      if (promo.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(promo.maxDiscount));
      }
    } else {
      // FIXED
      discountAmount = Math.min(discountVal, orderTotal);
    }

    discountAmount = Math.round(discountAmount);

    return res.status(200).json({
      valid: true,
      code: promo.code,
      title: promo.title,
      discountType: promo.discountType,
      discountValue: discountVal,
      discountAmount,
      finalTotal: Math.max(0, orderTotal - discountAmount)
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra mã khuyến mãi:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

/**
 * CRM Admin: Lấy danh sách toàn bộ khuyến mãi
 */
const getAllPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = promotions.map(p => ({
      ...p,
      discountValue: Number(p.discountValue),
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : null,
      minOrderValue: Number(p.minOrderValue || 0)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khuyến mãi CRM:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

/**
 * CRM Admin: Tạo mã khuyến mãi mới
 */
const createPromotion = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    if (!code || !discountValue) {
      return res.status(400).json({ error: 'Mã khuyến mãi và giá trị giảm là bắt buộc.' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate
    const existing = await prisma.promotion.findUnique({
      where: { code: cleanCode }
    });
    if (existing) {
      return res.status(400).json({ error: 'Mã khuyến mãi này đã tồn tại trên hệ thống.' });
    }

    const createdBy = req.user?.id || null;

    const newPromo = await prisma.promotion.create({
      data: {
        code: cleanCode,
        title: title || cleanCode,
        description: description || null,
        discountType: discountType || 'FIXED',
        discountValue: Number(discountValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        createdBy
      }
    });

    res.status(201).json({
      message: 'Tạo mã khuyến mãi thành công',
      promotion: {
        ...newPromo,
        discountValue: Number(newPromo.discountValue),
        maxDiscount: newPromo.maxDiscount ? Number(newPromo.maxDiscount) : null,
        minOrderValue: Number(newPromo.minOrderValue || 0)
      }
    });
  } catch (error) {
    console.error('Lỗi khi tạo mã khuyến mãi CRM:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

/**
 * CRM Admin: Cập nhật mã khuyến mãi
 */
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    const promo = await prisma.promotion.findUnique({ where: { id } });
    if (!promo) {
      return res.status(404).json({ error: 'Không tìm thấy mã khuyến mãi.' });
    }

    const updateData = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (discountType) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue ? Number(minOrderValue) : 0;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    if (validFrom !== undefined) updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.promotion.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      message: 'Cập nhật mã khuyến mãi thành công',
      promotion: {
        ...updated,
        discountValue: Number(updated.discountValue),
        maxDiscount: updated.maxDiscount ? Number(updated.maxDiscount) : null,
        minOrderValue: Number(updated.minOrderValue || 0)
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật mã khuyến mãi:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

/**
 * CRM Admin: Xóa mã khuyến mãi
 */
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await prisma.promotion.findUnique({ where: { id } });
    if (!promo) {
      return res.status(404).json({ error: 'Không tìm thấy mã khuyến mãi.' });
    }

    await prisma.promotion.delete({ where: { id } });
    res.status(200).json({ message: 'Xóa mã khuyến mãi thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa mã khuyến mãi:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

module.exports = {
  getAvailablePromotions,
  validatePromotion,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
};
