const prisma = require('../config/prisma');

async function createProduct(data) {
  const { name, category, basePrice, variants } = data;
  
  return prisma.product.create({
    data: {
      name,
      category,
      basePrice: parseFloat(basePrice),
      heroImage: data.heroImage || null,
      description: data.description || null,
      highlights: data.highlights || null,
      specs: data.specs || null,
      camera: data.camera || null,
      performance: data.performance || null,
      design: data.design || null,
      edition: data.edition || null,
      watermarkText: data.watermarkText || null,
      variants: {
        create: (variants || []).map(v => ({
          color: v.color,
          storage: v.storage,
          price: parseFloat(v.price) || parseFloat(basePrice),
          stockQuantity: parseInt(v.stockQuantity) || 0,
          image: v.image || null
        }))
      }
    },
    include: {
      variants: true
    }
  });
}

async function getAllProducts() {
  return prisma.product.findMany({
    include: {
      variants: true
    },
    orderBy: {
      name: 'asc'
    }
  });
}

async function getProductById(id) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: true
    }
  });
}

const parsePrice = (val, fallback = 0) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? fallback : num;
};

const parseStock = (val, fallback = 0) => {
  if (val === undefined || val === null) return fallback;
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : Math.max(0, num);
};

async function updateProduct(id, data) {
  const { name, category, basePrice, heroImage, description, highlights, specs, camera, performance, design, edition, watermarkText, variants } = data;

  const parsedBasePrice = basePrice !== undefined ? parsePrice(basePrice, 0) : undefined;

  // Xử lý cập nhật Variant: Xóa cũ, thêm mới an toàn
  if (Array.isArray(variants)) {
    try {
      await prisma.productVariant.deleteMany({
        where: { productId: id }
      });
    } catch (delErr) {
      console.warn('Could not delete old variants with deleteMany:', delErr.message);
    }
  }

  const updateData = {
    ...(name !== undefined && { name }),
    ...(category !== undefined && { category }),
    ...(parsedBasePrice !== undefined && { basePrice: parsedBasePrice }),
    ...(heroImage !== undefined && { heroImage }),
    ...(description !== undefined && { description }),
    ...(highlights !== undefined && { highlights }),
    ...(specs !== undefined && { specs }),
    ...(camera !== undefined && { camera }),
    ...(performance !== undefined && { performance }),
    ...(design !== undefined && { design }),
    ...(edition !== undefined && { edition }),
    ...(watermarkText !== undefined && { watermarkText }),
  };

  if (Array.isArray(variants)) {
    updateData.variants = {
      create: variants.map(v => ({
        color: v.color || null,
        storage: v.storage || null,
        price: parsePrice(v.price, parsedBasePrice || 0),
        stockQuantity: parseStock(v.stockQuantity, 0),
        image: v.image || null
      }))
    };
  }

  return prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      variants: true
    }
  });
}

async function updateStock(id, data = {}) {
  const { inStock, quantity, variants } = data;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true }
  });

  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }

  if (Array.isArray(variants) && variants.length > 0) {
    try {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    } catch (e) {}

    return prisma.product.update({
      where: { id },
      data: {
        variants: {
          create: variants.map(v => ({
            color: v.color || null,
            storage: v.storage || null,
            price: parsePrice(v.price, parseFloat(product.basePrice) || 0),
            stockQuantity: parseStock(v.stockQuantity, 0),
            image: v.image || null
          }))
        }
      },
      include: { variants: true }
    });
  }

  const targetQty = inStock === false ? 0 : (quantity !== undefined ? parseStock(quantity, 10) : 10);

  if (product.variants && product.variants.length > 0) {
    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: { stockQuantity: targetQty }
    });
  } else {
    await prisma.productVariant.create({
      data: {
        productId: id,
        color: 'Tiêu chuẩn',
        storage: 'Tiêu chuẩn',
        price: product.basePrice,
        stockQuantity: targetQty,
        image: product.heroImage || null
      }
    });
  }

  return prisma.product.findUnique({
    where: { id },
    include: { variants: true }
  });
}

async function deleteProduct(id) {
  return prisma.product.delete({
    where: { id }
  });
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct
};
