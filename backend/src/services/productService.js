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

async function updateProduct(id, data) {
  const { name, category, basePrice, heroImage, description, highlights, specs, camera, performance, design, edition, watermarkText, variants } = data;

  // Xử lý cập nhật Variant: Xóa cũ, thêm mới (cách đơn giản nhất)
  // Thực tế có thể dùng upsert, nhưng xóa đi tạo lại sẽ dễ hơn với mảng.
  if (variants) {
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
      ...(heroImage !== undefined && { heroImage }),
      ...(description !== undefined && { description }),
      ...(highlights !== undefined && { highlights }),
      ...(specs !== undefined && { specs }),
      ...(camera !== undefined && { camera }),
      ...(performance !== undefined && { performance }),
      ...(design !== undefined && { design }),
      ...(edition !== undefined && { edition }),
      ...(watermarkText !== undefined && { watermarkText }),
      ...(variants && {
        variants: {
          create: variants.map(v => ({
            color: v.color,
            storage: v.storage,
            price: parseFloat(v.price) || parseFloat(basePrice || 0),
            stockQuantity: parseInt(v.stockQuantity) || 0,
            image: v.image || null
          }))
        }
      })
    },
    include: {
      variants: true
    }
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
  deleteProduct
};
