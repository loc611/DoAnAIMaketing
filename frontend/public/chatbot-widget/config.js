/**
 * chatbot-widget / config.js
 * Cấu hình cho AI Chatbot Widget
 */

window.CHATBOT_CONFIG = {
  // --- CẤU HÌNH API ---
  API_KEY: "", // Nhập OpenAI API Key tại đây (vd: "sk-...")
  API_URL: "https://api.openai.com/v1/chat/completions",
  MODEL: "gpt-4o-mini",

  // --- CẤU HÌNH GIAO DIỆN & TÊN GỌI ---
  BOT_NAME: "Pig Store Assistant",
  BOT_SUBTITLE: "Hỗ trợ trực tuyến 24/7",
  BOT_AVATAR: "🤖",

  WELCOME_MESSAGE: "Xin chào! 👋 Tôi là trợ lý AI của Pig Store. Tôi có thể giúp gì cho bạn hôm nay?",

  QUICK_SUGGESTIONS: [
    "📱 Tư vấn iPhone 16 Pro Max",
    "💻 Mac / MacBook mới nhất",
    "🛡️ Chính sách bảo hành & 1 đổi 1",
    "💳 Hướng dẫn trả góp 0%"
  ],

  SYSTEM_PROMPT: "Bạn là trợ lý tư vấn khách hàng chuyên nghiệp của Pig Store.",
  USE_MOCK_FALLBACK: true
};
