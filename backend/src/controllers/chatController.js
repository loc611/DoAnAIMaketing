const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/prisma');

// Đọc file kiến thức dự án (nếu có)
const knowledgePath = path.join(__dirname, '../data/company_knowledge.txt');
let companyKnowledge = '';
try {
  companyKnowledge = fs.readFileSync(knowledgePath, 'utf8');
} catch (err) {
  // Không có file kiến thức thì bỏ qua
}

const getDifyUrl = () => {
  let url = (process.env.DIFY_API_URL || 'https://api.dify.ai/v1').trim().replace(/\/+$/, '');
  if (url.includes('dify.ai') && !url.endsWith('/chat-messages')) {
    url += '/chat-messages';
  }
  return url;
};

const getDifyApiKey = () => {
  return (process.env.CHATBOT_API_KEY || process.env.DIFY_API_KEY || '').trim();
};

/**
 * Controller xử lý tin nhắn Chatbot (Dify AI Proxy kèm SSE Streaming)
 */
exports.handleChatMsg = async (req, res) => {
  try {
    const { 
      message, 
      conversation_id, 
      conversationId, 
      user, 
      response_mode = 'streaming',
      history 
    } = req.body;

    const queryText = message || req.body.query;
    const currentConvId = conversation_id || conversationId || '';
    const userId = user || 'user_' + (req.ip ? req.ip.replace(/[^a-zA-Z0-9]/g, '_') : 'guest');

    if (!queryText) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
    }

    const difyApiKey = getDifyApiKey();
    const difyEndpoint = getDifyUrl();

    // 1. NẾU CÓ DIFY API KEY: Gọi qua Dify API
    if (difyApiKey && difyApiKey !== 'your_dify_api_key_here') {
      const isStreaming = response_mode === 'streaming';

      const difyRes = await fetch(difyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${difyApiKey}`
        },
        body: JSON.stringify({
          inputs: {},
          query: queryText,
          response_mode: response_mode,
          conversation_id: currentConvId || undefined,
          user: userId
        })
      });

      if (!difyRes.ok) {
        const errJson = await difyRes.json().catch(() => ({}));
        console.error('Dify API Error:', errJson);
        const errMsg = errJson.message || errJson.description || `Dify Server Error (${difyRes.status})`;
        return res.status(difyRes.status).json({ error: errMsg });
      }

      // Xử lý Streaming (SSE)
      if (isStreaming) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();

        const reader = difyRes.body.getReader();
        const decoder = new TextDecoder('utf-8');

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
          }
        } catch (streamErr) {
          console.error('SSE Stream forward error:', streamErr);
        } finally {
          res.end();
        }
        return;
      }

      // Xử lý Blocking Mode (JSON)
      const data = await difyRes.json();
      return res.json({
        reply: data.answer,
        conversation_id: data.conversation_id,
        raw: data
      });
    }

    // 2. FALLBACK 1: GEMINI AI (Nếu có GEMINI_API_KEY)
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const products = await prisma.product.findMany({ include: { variants: true } }).catch(() => []);
      const catalog = products.map(p => ({
        name: p.name,
        basePrice: p.basePrice,
        variants: p.variants.map(v => ({ color: v.color, storage: v.storage, priceMultiplier: v.priceMultiplier, stock: v.stockQuantity }))
      }));

      const systemInstruction = `Bạn là trợ lý ảo bán hàng của Apple Store VN. Hãy luôn trả lời lịch sự, ngắn gọn và hữu ích.
Danh mục sản phẩm: ${JSON.stringify(catalog)}
Chính sách: ${companyKnowledge}`;

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction
      });

      const formattedHistory = history ? history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })) : [];

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: { maxOutputTokens: 1000 },
      });

      const result = await chat.sendMessage(queryText);
      const response = await result.response;
      return res.json({ reply: response.text() });
    }

    // 3. FALLBACK 2: Trả lời tự động nếu chưa có API Key
    return res.json({
      reply: `[Pig Store AI] Xin chào! Tôi đã nhận được tin nhắn: "${queryText}". Hiện tại hệ thống đang kết nối dữ liệu máy chủ.`
    });

  } catch (error) {
    console.error('Lỗi tại chatController:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || 'Hệ thống AI đang bảo trì. Vui lòng thử lại sau.'
      });
    }
  }
};

