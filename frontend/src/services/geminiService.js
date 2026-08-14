import { GoogleGenerativeAI } from '@google/generative-ai';

// Lấy API Key từ biến môi trường của Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Khởi tạo Gemini AI SDK
const genAI = new GoogleGenerativeAI(API_KEY || 'dummy_key');

// SYSTEM INSTRUCTION: Định hình năng lực 2-trong-1 của Chatbot
const systemInstruction = `
Bạn là Trợ lý AI Toàn năng, hoạt động theo 2 nguyên tắc chính:
1. Trợ lý Bán hàng Apple: Nếu người dùng hỏi về các sản phẩm Apple (iPhone, iPad, Mac, AirPods, Apple Watch, phụ kiện), hãy đóng vai chuyên viên tư vấn nhiệt tình. Tư vấn cấu hình, so sánh các dòng máy, gợi ý mua kèm phụ kiện (Cross-selling) và giải đáp chính sách bán hàng.
2. Trợ lý vạn năng (ChatGPT): Nếu người dùng hỏi các kiến thức ngoài lề (lập trình, giải toán, dịch thuật, mẹo đời sống...), HÃY trả lời bình thường, chính xác và linh hoạt như ChatGPT. Không bao giờ từ chối trả lời vì lý do "nằm ngoài phạm vi bán hàng".

Tông giọng: Lịch sự, thông minh, rõ ràng. Trình bày có gạch đầu dòng/bảng biểu khi cần thiết để người dùng dễ đọc.
`;

// Khởi tạo model với cấu hình System Instruction
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: systemInstruction,
});

/**
 * Khởi tạo phiên chat với lịch sử cũ (Multi-turn conversation)
 * @param {Array} history Lịch sử tin nhắn [{ text, sender }, ...]
 * @returns {ChatSession} Đối tượng chat của Gemini
 */
export const initializeChat = (history = []) => {
  // Lọc bỏ tin nhắn báo lỗi và tin nhắn rỗng
  let formattedHistory = history
    .filter(msg => !msg.isError && msg.text && msg.text.trim().length > 0)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  // Gemini bắt buộc history phải BẮT ĐẦU bằng 'user'.
  // Nếu tin nhắn đầu tiên là của 'model' (ví dụ câu chào), ta phải bỏ nó đi.
  while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
    formattedHistory.shift();
  }

  // Gemini bắt buộc history phải luân phiên user -> model.
  // Để an toàn và đơn giản, nếu bị lỗi cấu trúc, ta có thể catch khi startChat.
  return model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 2000,
      temperature: 0.7,
    },
  });
};

/**
 * Gửi tin nhắn lên Gemini và nhận kết quả dạng chuỗi (Streaming)
 * @param {ChatSession} chatSession Phiên chat đang hoạt động
 * @param {string} message Tin nhắn của người dùng
 * @param {Function} onChunk Callback gọi mỗi khi nhận được 1 đoạn văn bản mới
 * @param {Function} onError Callback gọi khi xảy ra lỗi
 */
export const sendMessageStream = async (chatSession, message, onChunk, onError) => {
  try {
    if (!API_KEY) {
      throw new Error('MISSING_API_KEY');
    }

    const result = await chatSession.sendMessageStream(message);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(fullText); // Gửi từng đoạn text về UI để tạo hiệu ứng chữ chảy
    }

    return fullText;
  } catch (error) {
    console.error('Lỗi Gemini API:', error);
    if (onError) {
      if (error.message === 'MISSING_API_KEY') {
        onError('Vui lòng cấu hình VITE_GEMINI_API_KEY trong file .env để AI hoạt động.');
      } else {
        onError('Hệ thống AI đang bận hoặc quá tải. Vui lòng thử lại sau.');
      }
    }
  }
};
