/**
 * chatbot-widget / config.js
 * Cấu hình cho AI Chatbot Widget
 */

window.CHATBOT_CONFIG = {
  // --- CẤU HÌNH API ---
  // Nhập API Key của bạn tại đây (ví dụ: OpenAI API Key "sk-...")
  // Nếu để trống (""), Chatbot sẽ tự động hoạt động ở chế độ Demo (Mock Mode)
  API_KEY: "",

  // Đường dẫn API (Mặc định dùng OpenAI Chat Completions endpoint)
  API_URL: "https://api.openai.com/v1/chat/completions",

  // Tên mô hình AI (ví dụ: gpt-4o-mini, gpt-3.5-turbo, v.v.)
  MODEL: "gpt-4o-mini",

  // --- CẤU HÌNH GIAO DIỆN & TÊN GỌI ---
  BOT_NAME: "AI3D Assistant",
  BOT_SUBTITLE: "Hỗ trợ trực tuyến 24/7",
  BOT_AVATAR: "🤖", // Emoji hoặc URL hình ảnh

  // Lời chào mặc định khi mở chatbox lần đầu
  WELCOME_MESSAGE: "Xin chào! 👋 Tôi là trợ lý AI của AI3D Store. Tôi có thể giúp gì cho bạn hôm nay?",

  // Các gợi ý câu hỏi nhanh (Quick Suggestion Chips)
  QUICK_SUGGESTIONS: [
    "📱 Tư vấn iPhone 16 Pro Max",
    "💻 Mac / MacBook mới nhất",
    "🛡️ Chính sách bảo hành & 1 đổi 1",
    "💳 Hướng dẫn trả góp 0%"
  ],

  // System Prompt định hướng tính cách & tri thức cho AI
  SYSTEM_PROMPT: "Bạn là trợ lý tư vấn khách hàng chuyên nghiệp, thân thiện của cửa hàng công nghệ AI3D Store. Hãy trả lời ngắn gọn, rõ ràng, lịch sự và hỗ trợ người dùng tìm kiếm sản phẩm phù hợp.",

  // --- BẢO MẬT & TRẢ LỜI TỰ ĐỘNG (MOCK MODE) ---
  // Tự động dùng phản hồi thông minh nếu chưa có API Key
  USE_MOCK_FALLBACK: true
};
