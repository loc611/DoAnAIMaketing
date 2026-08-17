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

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    return res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
};
