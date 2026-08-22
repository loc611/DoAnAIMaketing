/**
 * Dify Chat Service
 * Xử lý kết nối Dify Chat API (Streaming & Blocking)
 * Tự động lọc bỏ các bước xử lý (agent_thought, workflow process) để chỉ trả về câu trả lời hoàn chỉnh.
 */

const getApiUrl = () => {
  const backendBase = import.meta.env.VITE_API_URL || '';
  // Nếu có VITE_API_URL và không phải là Dify direct URL thì dùng backend proxy
  if (backendBase && !backendBase.includes('dify.ai')) {
    return `${backendBase.replace(/\/+$/, '')}/api/chat`;
  }
  return '/api/chat';
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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        query: message,
        response_mode: 'streaming',
        conversation_id: conversationId || undefined,
        user: getUserId(),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error || errData.message || errData.description || `Lỗi máy chủ (${response.status})`;
      if (response.status === 401) {
        throw new Error('API Key của Dify chưa được cấu hình hoặc không hợp lệ trên máy chủ Backend. Vui lòng kiểm tra file backend/.env.');
      }
      if (errorMsg.includes('credit')) {
        throw new Error('Tài khoản AI đang tạm thời hết credit. Vui lòng nạp thêm credit hoặc cập nhật API Key.');
      }
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Nếu backend trả về JSON (Blocking mode hoặc Mock fallback)
    if (contentType.includes('application/json')) {
      const json = await response.json();
      const replyText = json.reply || json.answer || '';
      const newConvId = json.conversation_id || json.conversationId || conversationId;
      if (onChunk) onChunk(replyText);
      if (onComplete) onComplete({ answer: replyText, conversationId: newConvId });
      return { answer: replyText, conversationId: newConvId };
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
