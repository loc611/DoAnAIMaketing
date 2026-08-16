/**
 * chatbot-widget / script.js
 * Logic xử lý Chatbot AI Widget: Giao diện, gửi tin nhắn, gọi API & Mock Fallback
 */

(function () {
  'use strict';

  // 1. Kiểm tra & Load Cấu hình
  const config = Object.assign(
    {
      API_KEY: '',
      API_URL: 'https://api.openai.com/v1/chat/completions',
      MODEL: 'gpt-4o-mini',
      BOT_NAME: 'AI3D Assistant',
      BOT_SUBTITLE: 'Hỗ trợ trực tuyến 24/7',
      BOT_AVATAR: '🤖',
      WELCOME_MESSAGE: 'Xin chào! 👋 Tôi là trợ lý AI của Pig Store. Bạn cần tư vấn sản phẩm gì hôm nay?',
      QUICK_SUGGESTIONS: [
        '📱 Tư vấn iPhone 16 Pro Max',
        '💻 Mac / MacBook mới nhất',
        '🛡️ Chính sách bảo hành',
        '💳 Hướng dẫn trả góp 0%'
      ],
      SYSTEM_PROMPT: 'Bạn là trợ lý tư vấn khách hàng của cửa hàng AI3D Store. Trả lời thân thiện, hữu ích.',
      USE_MOCK_FALLBACK: true
    },
    window.CHATBOT_CONFIG || {}
  );

  // Lưu trữ lịch sử trò chuyện
  let chatHistory = JSON.parse(localStorage.getItem('cb_chat_history') || '[]');

  // 2. Tạo HTML DOM của Widget
  function createWidgetDOM() {
    if (document.getElementById('cb-widget-root')) return;

    const rootNode = document.createElement('div');
    rootNode.id = 'cb-widget-root';
    rootNode.className = 'cb-widget-root';

    rootNode.innerHTML = `
      <!-- Launcher Button -->
      <button id="cb-launcher-btn" class="cb-launcher-btn" title="Mở Trợ Lý AI" aria-label="Mở Trợ Lý AI">
        <span class="cb-badge" id="cb-badge"></span>
        <svg class="cb-launcher-icon cb-chat-icon" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
        </svg>
        <svg class="cb-launcher-icon cb-close-icon" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>

      <!-- Chat Window -->
      <div id="cb-window" class="cb-window">
        <!-- Header -->
        <div class="cb-header">
          <div class="cb-header-info">
            <div class="cb-avatar">
              ${config.BOT_AVATAR}
              <span class="cb-status-dot"></span>
            </div>
            <div class="cb-title-container">
              <span class="cb-title">${config.BOT_NAME}</span>
              <span class="cb-subtitle">${config.BOT_SUBTITLE}</span>
            </div>
          </div>
          <div class="cb-header-actions">
            <button id="cb-reset-btn" class="cb-icon-btn" title="Xóa lịch sử trò chuyện">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            </button>
            <button id="cb-close-btn" class="cb-icon-btn" title="Đóng chat">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        <!-- Body / Messages -->
        <div id="cb-body" class="cb-body"></div>

        <!-- Footer / Input -->
        <div class="cb-footer">
          <div class="cb-input-row">
            <textarea id="cb-textarea" class="cb-textarea" placeholder="Nhập tin nhắn..." rows="1"></textarea>
            <button id="cb-send-btn" class="cb-send-btn" title="Gửi tin nhắn">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div class="cb-footer-branding">Cung cấp bởi AI3D Assistant</div>
        </div>
      </div>
    `;

    document.body.appendChild(rootNode);
  }

  // 3. Render tin nhắn & UI Controls
  function initWidget() {
    createWidgetDOM();

    const rootEl = document.getElementById('cb-widget-root');
    const launcherBtn = document.getElementById('cb-launcher-btn');
    const closeBtn = document.getElementById('cb-close-btn');
    const resetBtn = document.getElementById('cb-reset-btn');
    const sendBtn = document.getElementById('cb-send-btn');
    const textarea = document.getElementById('cb-textarea');
    const bodyEl = document.getElementById('cb-body');
    const badgeEl = document.getElementById('cb-badge');

    // Toggle Chat Window
    launcherBtn.addEventListener('click', () => {
      rootEl.classList.toggle('cb-active');
      if (rootEl.classList.contains('cb-active')) {
        badgeEl.style.display = 'none';
        textarea.focus();
        scrollToBottom();
      }
    });

    closeBtn.addEventListener('click', () => {
      rootEl.classList.remove('cb-active');
    });

    resetBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
        chatHistory = [];
        localStorage.removeItem('cb_chat_history');
        renderMessages();
      }
    });

    // Auto-resize Textarea
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    });

    // Enter to Send (Shift+Enter for newline)
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    sendBtn.addEventListener('click', handleSendMessage);

    // Initial render
    renderMessages();
  }

  // Cuộn tin nhắn xuống dưới cùng
  function scrollToBottom() {
    const bodyEl = document.getElementById('cb-body');
    if (bodyEl) {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }
  }

  // Format thời gian HH:MM
  function getTimeString() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  // Parse HTML đơn giản (bold, newlines)
  function formatText(text) {
    if (!text) return '';
    let formatted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  }

  // Render toàn bộ lịch sử tin nhắn
  function renderMessages() {
    const bodyEl = document.getElementById('cb-body');
    if (!bodyEl) return;

    bodyEl.innerHTML = '';

    // Nếu chưa có tin nhắn, hiển thị tin chào mừng + suggestion chips
    if (chatHistory.length === 0) {
      appendBotMessageDOM(config.WELCOME_MESSAGE, getTimeString());
      appendSuggestionsDOM();
      return;
    }

    chatHistory.forEach((msg) => {
      if (msg.role === 'user') {
        appendUserMessageDOM(msg.content, msg.time || getTimeString());
      } else {
        appendBotMessageDOM(msg.content, msg.time || getTimeString());
      }
    });

    scrollToBottom();
  }

  function appendUserMessageDOM(text, time) {
    const bodyEl = document.getElementById('cb-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'cb-message cb-user';
    msgDiv.innerHTML = `
      <div class="cb-msg-bubble">${formatText(text)}</div>
      <span class="cb-msg-time">${time}</span>
    `;
    bodyEl.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendBotMessageDOM(text, time) {
    const bodyEl = document.getElementById('cb-body');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'cb-message cb-bot';
    msgDiv.innerHTML = `
      <div class="cb-msg-bubble">${formatText(text)}</div>
      <span class="cb-msg-time">${time}</span>
    `;
    bodyEl.appendChild(msgDiv);
    scrollToBottom();
  }

  function appendSuggestionsDOM() {
    if (!config.QUICK_SUGGESTIONS || config.QUICK_SUGGESTIONS.length === 0) return;
    const bodyEl = document.getElementById('cb-body');
    const sugDiv = document.createElement('div');
    sugDiv.className = 'cb-suggestions';

    config.QUICK_SUGGESTIONS.forEach((sug) => {
      const chip = document.createElement('button');
      chip.className = 'cb-chip';
      chip.innerText = sug;
      chip.addEventListener('click', () => {
        const textarea = document.getElementById('cb-textarea');
        textarea.value = sug;
        handleSendMessage();
      });
      sugDiv.appendChild(chip);
    });

    bodyEl.appendChild(sugDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const bodyEl = document.getElementById('cb-body');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'cb-typing';
    typingDiv.className = 'cb-message cb-bot';
    typingDiv.innerHTML = `
      <div class="cb-typing-indicator">
        <div class="cb-typing-dot"></div>
        <div class="cb-typing-dot"></div>
        <div class="cb-typing-dot"></div>
      </div>
    `;
    bodyEl.appendChild(typingDiv);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const typingDiv = document.getElementById('cb-typing');
    if (typingDiv) typingDiv.remove();
  }

  // 4. Xử lý Gửi tin nhắn
  async function handleSendMessage() {
    const textarea = document.getElementById('cb-textarea');
    const sendBtn = document.getElementById('cb-send-btn');
    const text = textarea.value.trim();
    if (!text) return;

    // Reset textarea
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;

    const userTime = getTimeString();

    // 1. Thêm vào giao diện & Lịch sử
    appendUserMessageDOM(text, userTime);
    chatHistory.push({ role: 'user', content: text, time: userTime });
    saveChatHistory();

    // Remove Quick Suggestion chips nếu có
    const sugEl = document.querySelector('.cb-suggestions');
    if (sugEl) sugEl.remove();

    // 2. Hiển thị typing indicator
    showTypingIndicator();

    try {
      let botResponse = '';

      // Kiểm tra API Key
      if (config.API_KEY && config.API_KEY.trim() !== '') {
        botResponse = await callOpenAIAPI(text);
      } else {
        // Nếu không có API Key, dùng Trả lời tự động thông minh (Mock Mode)
        botResponse = await getMockResponse(text);
      }

      hideTypingIndicator();
      const botTime = getTimeString();
      appendBotMessageDOM(botResponse, botTime);
      chatHistory.push({ role: 'assistant', content: botResponse, time: botTime });
      saveChatHistory();
    } catch (err) {
      console.error('Chatbot API Error:', err);
      hideTypingIndicator();
      const botTime = getTimeString();
      const errMessage = '⚠️ Xin lỗi, đã có lỗi kết nối xảy ra. Vui lòng kiểm tra API Key hoặc kết nối mạng của bạn!';
      appendBotMessageDOM(errMessage, botTime);
    } finally {
      sendBtn.disabled = false;
      textarea.focus();
    }
  }

  // 5. Gọi API OpenAI thật
  async function callOpenAIAPI(userQuery) {
    const messagesPayload = [
      { role: 'system', content: config.SYSTEM_PROMPT },
      ...chatHistory.slice(-6).map((item) => ({
        role: item.role === 'user' ? 'user' : 'assistant',
        content: item.content
      })),
      { role: 'user', content: userQuery }
    ];

    const res = await fetch(config.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.API_KEY}`
      },
      body: JSON.stringify({
        model: config.MODEL,
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 400
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content || 'Không nhận được phản hồi từ AI.';
  }

  // 6. Trả lời tự động thông minh (Mock AI Mode)
  function getMockResponse(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const q = query.toLowerCase();

        if (q.includes('iphone') || q.includes('16 pro') || q.includes('15 pro') || q.includes('14 pro')) {
          resolve('📱 **AI3D Store** hiện sẵn hàng các dòng iPhone mới nhất:\n• **iPhone 16 Pro Max**: Titan Vũ Trụ, chip A19 Pro, giá từ 29.999.000đ.\n• **iPhone 15 Pro Max**: Khung Titan nhẹ bền, chip A17 Pro, giá từ 24.999.000đ.\n\n🎁 Ưu đãi đính kèm: Trợ giá thu cũ đổi mới lên đến 3.000.000đ và tặng bảo hành 12 tháng 1 đổi 1!');
        } else if (q.includes('mac') || q.includes('macbook') || q.includes('imac')) {
          resolve('💻 Các sản phẩm Mac tại **AI3D Store**:\n• **MacBook Pro M4**: Hiệu năng khủng cho đồ họa & AI 3D.\n• **MacBook Air M3**: Siêu mỏng nhẹ, pin 18h liên tục.\n• **Mac mini M4**: Nhỏ gọn vượt trội.\n\nBạn muốn tư vấn cấu hình RAM / SSD nào cụ thể không?');
        } else if (q.includes('bảo hành') || q.includes('đổi trả') || q.includes('warranty')) {
          resolve('🛡️ **Chính sách bảo hành tại AI3D Store**:\n• Bảo hành chính hãng **12 tháng**.\n• **1 đổi 1 trong 30 ngày** nếu phát sinh lỗi nhà sản xuất.\n• Hỗ trợ kỹ thuật & vệ sinh máy miễn phí trọn đời.');
        } else if (q.includes('trả góp') || q.includes('thanh toán') || q.includes('góp')) {
          resolve('💳 **Chương trình Trả Góp 0%**:\n• Hỗ trợ trả góp qua thẻ tín dụng hơn 25 ngân hàng.\n• Xét duyệt hồ sơ online cực nhanh chỉ 5 phút với CCCD.\n• Trả trước 0đ nhận máy ngay!');
        } else if (q.includes('giá') || q.includes('báo giá') || q.includes('khuyến mãi')) {
          resolve('🏷️ Các siêu phẩm đang được giảm bốc đến **15-20%** tuần này! Hãy chọn sản phẩm bạn quan tâm để tôi báo giá chính xác nhất nhé!');
        } else {
          resolve(`Cảm ơn câu hỏi của bạn: "*${query}*".\n\n💡 Trợ lý AI đang chạy ở chế độ Demo (Mock Mode). Hãy nhập **API Key** vào file \`config.js\` để kết nối trực tiếp với OpenAI hoặc AI backend của bạn!`);
        }
      }, 700);
    });
  }

  function saveChatHistory() {
    try {
      localStorage.setItem('cb_chat_history', JSON.stringify(chatHistory.slice(-20)));
    } catch (e) {
      console.warn('Cannot save chat history:', e);
    }
  }

  // Khởi chạy sau khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
