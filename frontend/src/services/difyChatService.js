/**
 * Dify Chat Service
 * Xử lý kết nối Dify Chat API (Streaming & Blocking)
 * Tự động lọc bỏ các bước xử lý (agent_thought, workflow process) để chỉ trả về câu trả lời hoàn chỉnh.
 */

const getApiUrl = () => {
  let url = (
    import.meta.env.VITE_CHATBOT_API_URL ||
    import.meta.env.VITE_DIFY_API_URL ||
    'https://api.dify.ai/v1'
  ).trim().replace(/\/+$/, '');
  if (url.includes('dify.ai') && !url.endsWith('/chat-messages')) {
    url += '/chat-messages';
  }
  return url;
};

const getApiKey = () => {
  return (
    import.meta.env.VITE_CHATBOT_API_KEY ||
    import.meta.env.VITE_DIFY_API_KEY ||
    'app-0Td2Ld0Ehd87EbGvOiSPC7ah'
  ).trim();
};

// Tạo hoặc lấy User ID ẩn danh cố định cho phiên truy cập
const getUserId = () => {
  let userId = localStorage.getItem('dify_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('dify_user_id', userId);
  }
  return userId;
};

/**
 * Gửi tin nhắn đến Chatbot API dạng streaming
 * @param {string} message - Tin nhắn người dùng
 * @param {string} conversationId - ID cuộc hội thoại (nếu có)
 * @param {function} onChunk - Callback nhận từng phần văn bản trả về
 * @param {function} onComplete - Callback khi hoàn tất kèm conversation_id mới
 * @param {function} onError - Callback khi có lỗi
 */
export const sendDifyMessageStream = async ({
  message,
  conversationId = '',
  onChunk,
  onComplete,
  onError
}) => {
  try {
    const endpoint = getApiUrl();
    const apiKey = getApiKey();

    const headers = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: 'streaming',
        conversation_id: conversationId || undefined,
        user: getUserId(),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.message || errData.description || `Lỗi máy chủ (${response.status})`;
      if (errData.code === 'insufficient_credits' || errorMsg.includes('credits')) {
        throw new Error('Tài khoản AI đang tạm thời hết credit. Vui lòng nạp thêm credit hoặc cập nhật API Key.');
      }
      throw new Error(errorMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedAnswer = '';
    let currentConversationId = conversationId;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Giữ lại phần chưa đủ 1 dòng hoàn chỉnh

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);

          // Cập nhật conversation_id nếu có
          if (parsed.conversation_id) {
            currentConversationId = parsed.conversation_id;
          }

          // YÊU CẦU 2: Bỏ qua toàn bộ quá trình xử lý (agent_thought, workflow, node)
          // CHỈ xử lý sự kiện 'message' hoặc 'agent_message' chứa nội dung trả lời trực tiếp
          if (parsed.event === 'message' || parsed.event === 'agent_message') {
            if (parsed.answer) {
              accumulatedAnswer += parsed.answer;
              if (onChunk) onChunk(accumulatedAnswer);
            }
          } else if (parsed.event === 'error') {
            throw new Error(parsed.message || 'Lỗi xử lý tin nhắn từ AI');
          } else if (parsed.event === 'message_end') {
            // Hoàn thành streaming
            if (onComplete) {
              onComplete({
                answer: accumulatedAnswer,
                conversationId: currentConversationId
              });
            }
          }
        } catch (parseErr) {
          // Bỏ qua dòng json không hợp lệ (nếu có)
          if (parseErr.message && !parseErr.message.includes('JSON')) {
            throw parseErr;
          }
        }
      }
    }

    if (onComplete && accumulatedAnswer) {
      onComplete({
        answer: accumulatedAnswer,
        conversationId: currentConversationId
      });
    }

    return { answer: accumulatedAnswer, conversationId: currentConversationId };

  } catch (error) {
    console.error('Dify Chat Error:', error);
    if (onError) {
      onError(error.message || 'Đã có lỗi xảy ra khi kết nối tới Trợ lý ảo AI.');
    }
    throw error;
  }
};
