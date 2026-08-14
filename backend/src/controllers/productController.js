const productService = require('../services/productService');

exports.createProduct = async (req, res, next) => {
  try {
    const { name, basePrice } = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ error: 'Tên và Giá cơ bản là bắt buộc.' });
    }

    const product = await productService.createProduct(req.body);
    return res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};
