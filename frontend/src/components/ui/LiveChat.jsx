import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingIndicator from './TypingIndicator';
import { initializeChat, sendMessageStream } from '../../services/geminiService';

const INITIAL_MSG = { text: 'Xin chào! Tôi là Trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?', sender: 'agent' };

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) return JSON.parse(saved);
    return [INITIAL_MSG];
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Lưu lịch sử mỗi khi có thay đổi
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // 1. Thêm tin nhắn của User
    const newMsg = { text: textToSend, sender: 'user' };
    const currentHistory = [...messages, newMsg];
    setMessages(currentHistory);
    setInput('');
    setIsLoading(true);

    // 2. Thêm một tin nhắn rỗng của AI để chuẩn bị Streaming
    setMessages(prev => [...prev, { text: '', sender: 'agent', isStreaming: true }]);

    let isErrorHappened = false;

    try {
      // 3. Khởi tạo phiên chat với lịch sử cũ
      const chatSession = initializeChat(messages);

      // 4. Gọi hàm streaming
      await sendMessageStream(
        chatSession,
        textToSend,
        (chunkText) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = { ...newMessages[newMessages.length - 1] };
            if (lastMessage.sender === 'agent' && lastMessage.isStreaming) {
              lastMessage.text = chunkText;
              newMessages[newMessages.length - 1] = lastMessage;
            }
            return newMessages;
          });
        },
        (errorMsg) => {
          isErrorHappened = true;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { text: errorMsg, sender: 'agent', isError: true, isStreaming: false };
            return newMessages;
          });
        }
      );

      if (!isErrorHappened) {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = { ...newMessages[newMessages.length - 1] };
          if (lastMessage) {
            lastMessage.isStreaming = false;
            newMessages[newMessages.length - 1] = lastMessage;
          }
          return newMessages;
        });
      }

    } catch (error) {
      console.error('Lỗi khi chat:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = { ...newMessages[newMessages.length - 1] };
        if (lastMessage.sender === 'agent' && lastMessage.isStreaming) {
          lastMessage.text = 'Lỗi khởi tạo AI: Vui lòng tải lại trang hoặc kiểm tra kết nối.';
          lastMessage.isError = true;
          lastMessage.isStreaming = false;
          newMessages[newMessages.length - 1] = lastMessage;
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = ['Sản phẩm mới nhất', 'Chính sách bảo hành', 'Liên hệ hỗ trợ'];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-4 w-80 sm:w-96 h-[500px] rounded-3xl overflow-hidden flex flex-col bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="bg-[#1c1c1e]/90 p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                  
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Chuyên gia Apple</h3>
                  <p className="text-[#86868b] text-xs">Trực tuyến</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#86868b] hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                      ? 'bg-blue-600 text-white self-end rounded-tr-sm'
                      : msg.isError
                        ? 'bg-red-500/20 text-red-200 border border-red-500/30 self-start rounded-tl-sm'
                        : 'bg-[#2c2c2e] text-[#f5f5f7] self-start rounded-tl-sm'
                    }`}
                >
                  {msg.text}
                </div>
              ))}

              {isLoading && !messages[messages.length - 1]?.isStreaming && (
                <div className="self-start">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length < 3 && !isLoading && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(null, qr)}
                    className="whitespace-nowrap text-xs bg-[#2c2c2e] hover:bg-[#3c3c3e] text-[#f5f5f7] px-3 py-1.5 rounded-full transition-colors border border-white/5"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-[#1c1c1e]/90">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="w-full bg-[#2c2c2e] text-white rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-[#86868b]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-[#4a4a4c] transition-colors"
                >
                  ↑
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center text-2xl"
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>
    </div>
  );
}
