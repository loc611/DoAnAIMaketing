const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/prisma');

const fs = require('fs');
const path = require('path');

// Đọc file kiến thức dự án
const knowledgePath = path.join(__dirname, '../data/company_knowledge.txt');
let companyKnowledge = '';
try {
  companyKnowledge = fs.readFileSync(knowledgePath, 'utf8');
} catch (err) {
  console.log('Không tìm thấy file company_knowledge.txt');
}

// Khởi tạo Gemini với API key từ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

exports.handleChatMsg = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
    }

    // Nếu không có API KEY thật, trả về Mock Response (Giả lập)
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({ 
        reply: `[MOCK AI] Xin chào! Tôi là Trợ lý Ảo. Bạn chưa cấu hình GEMINI_API_KEY nên tôi trả lời tự động. Tin nhắn của bạn là: "${message}"`
      });
    }

    // 1. RAG (Retrieval-Augmented Generation)
    // Lấy dữ liệu sản phẩm thật từ Database
    const products = await prisma.product.findMany({
      include: { variants: true }
    });

    // Rút gọn dữ liệu cho Prompt
    const catalog = products.map(p => ({
      name: p.name,
      basePrice: p.basePrice,
      variants: p.variants.map(v => ({ color: v.color, storage: v.storage, priceMultiplier: v.priceMultiplier, stock: v.stockQuantity }))
    }));

    const systemInstruction = `Bạn là trợ lý ảo bán hàng của Apple Store VN. Hãy luôn trả lời lịch sự, ngắn gọn và hữu ích.
Đây là danh mục sản phẩm hiện tại của cửa hàng (Dữ liệu Thực tế từ Database):
${JSON.stringify(catalog, null, 2)}

Thông tin về Dự án và Chính sách Công ty:
${companyKnowledge}

Nếu khách hàng hỏi về giá, hãy tính bằng công thức: Giá cuối = basePrice * priceMultiplier. Đơn vị là VNĐ. Nếu sản phẩm nào có stock = 0, hãy báo là hết hàng.`;

    // 2. Lấy model gemini với systemInstruction (gemini-1.5-flash)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // Format lịch sử chat thành mảng { role: 'user' | 'model', parts: [{ text: '...' }] }
    const formattedHistory = history ? history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })) : [];

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { maxOutputTokens: 1000 },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    return res.json({ reply: response.text() });

  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    return res.status(500).json({ 
      error: 'Hệ thống AI đang bảo trì hoặc API Key không hợp lệ. Vui lòng thử lại sau.' 
    });
  }
};
