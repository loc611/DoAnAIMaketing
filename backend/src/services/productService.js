const prisma = require('../config/prisma');

async function createProduct(data) {
  const { name, category, basePrice, variants } = data;
  
  return prisma.product.create({
    data: {
      name,
      category,
      basePrice: parseFloat(basePrice),
      variants: {
        create: (variants || []).map(v => ({
          color: v.color,
          storage: v.storage,
          price: parseFloat(v.price) || parseFloat(basePrice),
          stockQuantity: parseInt(v.stockQuantity) || 0
        }))
      }
    },
    include: {
      variants: true
    }
  });
}

module.exports = {
  createProduct
};
