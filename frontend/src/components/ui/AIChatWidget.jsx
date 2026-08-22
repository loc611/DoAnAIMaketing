import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperPlaneRight, 
  X, 
  ArrowsOut, 
  ArrowsIn, 
  ArrowCounterClockwise, 
  Robot, 
  User, 
  Sparkle,
  WarningCircle
} from '@phosphor-icons/react';
import { sendDifyMessageStream } from '../../services/difyChatService';

const INITIAL_MESSAGE = {
  id: 'init-msg',
  sender: 'ai',
  text: 'Xin chào! Tôi là Trợ lý ảo AI của Pig Store. Tôi có thể hỗ trợ giải đáp thắc mắc, tư vấn chọn sản phẩm hoặc hỗ trợ đặt hàng cho bạn hôm nay!',
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const QUICK_SUGGESTIONS = [
  'iPhone 17 Pro có những điểm nổi bật gì?',
  'Chính sách bảo hành và đổi trả thế nào?',
  'Tư vấn giúp tôi chọn dòng máy phù hợp',
  'Có hỗ trợ trả góp 0% không?'
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => {
    return localStorage.getItem('dify_conversation_id') || '';
  });
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('dify_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [INITIAL_MESSAGE];
      }
    }
    return [INITIAL_MESSAGE];
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Lưu lịch sử và conversationId vào localStorage
  useEffect(() => {
    localStorage.setItem('dify_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('dify_conversation_id', conversationId);
    } else {
      localStorage.removeItem('dify_conversation_id');
    }
  }, [conversationId]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true);
    }
  }, [messages, isLoading]);

  // Reset cuộc trò chuyện
  const handleResetChat = () => {
    if (window.confirm('Bạn có muốn bắt đầu phiên trò chuyện mới không?')) {
      setMessages([INITIAL_MESSAGE]);
      setConversationId('');
      localStorage.removeItem('dify_conversation_id');
      localStorage.removeItem('dify_chat_history');
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'user-' + Date.now();
    const aiMsgId = 'ai-' + (Date.now() + 1);

    // 1. Thêm tin nhắn của User
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: timeStr
    };

    // 2. Thêm tin nhắn AI placeholder để nhận stream
    const placeholderAiMsg = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isStreaming: true,
      time: timeStr
    };

    setMessages(prev => [...prev, userMsg, placeholderAiMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await sendDifyMessageStream({
        message: query,
        conversationId: conversationId,
        onChunk: (accumulatedText) => {
          setMessages(prev => {
            return prev.map(msg => {
              if (msg.id === aiMsgId) {
                return { ...msg, text: accumulatedText };
              }
              return msg;
            });
          });
        },
        onComplete: ({ answer, conversationId: newConvId }) => {
          if (newConvId) setConversationId(newConvId);
          setMessages(prev => {
            return prev.map(msg => {
              if (msg.id === aiMsgId) {
                return { ...msg, text: answer || msg.text, isStreaming: false };
              }
              return msg;
            });
          });
        },
        onError: (errMsg) => {
          setMessages(prev => {
            return prev.map(msg => {
              if (msg.id === aiMsgId) {
                return { 
                  ...msg, 
                  text: errMsg || 'Đã có lỗi xảy ra trong quá trình xử lý.', 
                  isError: true, 
                  isStreaming: false 
                };
              }
              return msg;
            });
          });
        }
      });
    } catch (err) {
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === aiMsgId) {
            return { 
              ...msg, 
              text: err.message || 'Lỗi kết nối tới Trợ lý ảo AI.', 
              isError: true, 
              isStreaming: false 
            };
          }
          return msg;
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999999] font-sans antialiased">
      {/* Cửa sổ Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col bg-[#121214]/95 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'w-[90vw] max-w-[650px] h-[85vh] max-h-[750px]' 
                : 'w-[92vw] sm:w-[410px] h-[580px] max-h-[calc(100vh-120px)]'
            }`}
            style={{
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), 0 0 35px rgba(229, 193, 88, 0.15)',
              border: '1px solid rgba(229, 193, 88, 0.25)'
            }}
          >
            {/* Header: YÊU CẦU 4 -> Đổi tiêu đề thành "Trợ lý ảo AI" */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#18181c] via-[#212127] to-[#18181c] border-b border-white/10 flex items-center justify-between relative select-none">
              <div className="flex items-center gap-3">
                {/* Robot Avatar Icon */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d15a20] via-[#c89355] to-[#e5c158] flex items-center justify-center shadow-lg shadow-[#d15a20]/30 text-black">
                    <Robot size={22} weight="fill" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#18181c] rounded-full animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base tracking-wide">
                      Trợ lý ảo AI
                    </h3>
                    <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 bg-gradient-to-r from-[#e5c158]/20 to-[#d15a20]/20 text-[#e5c158] border border-[#e5c158]/30 rounded-full">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Sẵn sàng giải đáp 24/7
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 text-neutral-400">
                <button
                  onClick={handleResetChat}
                  title="Làm mới cuộc trò chuyện"
                  className="p-2 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <ArrowCounterClockwise size={18} />
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
                  className="p-2 hover:text-white hover:bg-white/5 rounded-xl transition-all hidden sm:flex"
                >
                  {isExpanded ? <ArrowsIn size={18} /> : <ArrowsOut size={18} />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="Đóng chat"
                  className="p-2 hover:text-white hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>
            </div>

            {/* Messages Content View */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth focus:outline-none">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#c89355] to-[#d15a20] flex-shrink-0 flex items-center justify-center text-black text-xs font-bold mt-1 shadow-sm">
                        <Sparkle size={14} weight="fill" />
                      </div>
                    )}

                    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[82%]`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                          isUser
                            ? 'bg-gradient-to-r from-[#d15a20] to-[#c89355] text-white font-medium rounded-tr-sm shadow-[#d15a20]/20'
                            : msg.isError
                              ? 'bg-red-950/40 border border-red-500/40 text-red-200 rounded-tl-sm flex items-start gap-2'
                              : 'bg-white/[0.06] border border-white/10 text-[#ededed] rounded-tl-sm backdrop-blur-md'
                        }`}
                      >
                        {msg.isError && <WarningCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />}
                        <div>
                          {msg.text ? (
                            msg.text
                          ) : msg.isStreaming ? (
                            <span className="flex items-center gap-1.5 text-neutral-400 italic">
                              <span className="w-1.5 h-1.5 bg-[#e5c158] rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-[#e5c158] rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 bg-[#e5c158] rounded-full animate-bounce [animation-delay:0.4s]" />
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {msg.time && (
                        <span className="text-[10px] text-neutral-500 mt-1 px-1">
                          {msg.time}
                        </span>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-white/10 flex-shrink-0 flex items-center justify-center text-neutral-300 text-xs mt-1 border border-white/10">
                        <User size={14} weight="bold" />
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-white/5 bg-black/20">
                <p className="text-[11px] text-neutral-400 mb-2 font-medium flex items-center gap-1">
                  <Sparkle size={12} className="text-[#e5c158]" /> Gợi ý câu hỏi nhanh:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {QUICK_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item)}
                      className="whitespace-nowrap text-xs px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#e5c158]/10 hover:border-[#e5c158]/40 border border-white/10 text-neutral-300 hover:text-[#e5c158] transition-all flex-shrink-0"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar: YÊU CẦU 3 -> Thay đổi placeholder thành 'Bạn cần tư vấn gì về sản phẩm?' */}
            {/* YÊU CẦU 1 -> Không có dòng POWERED BY Dify */}
            <div className="p-3 bg-[#18181c] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-black/40 border border-white/10 focus-within:border-[#e5c158]/60 focus-within:ring-1 focus-within:ring-[#e5c158]/40 rounded-2xl px-3 py-2 transition-all"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Bạn cần tư vấn gì về sản phẩm?"
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d15a20] to-[#e5c158] text-black flex items-center justify-center disabled:opacity-40 disabled:grayscale transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#d15a20]/20 flex-shrink-0"
                >
                  <PaperPlaneRight size={16} weight="fill" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08, translateY: -3 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#d15a20] via-[#c89355] to-[#e5c158] text-black flex items-center justify-center cursor-pointer shadow-xl relative group select-none"
        style={{
          border: '1.5px solid rgba(255, 243, 209, 0.7)',
          boxShadow: '0 10px 30px rgba(209, 90, 32, 0.5), 0 0 25px rgba(229, 193, 88, 0.4)'
        }}
        aria-label="Mở Trợ lý ảo AI"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} weight="bold" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <Robot size={28} weight="fill" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-black rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-[#e5c158]/30 text-[#e5c158] text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-xl">
            Trợ lý ảo AI 24/7 ✨
          </div>
        )}
      </motion.button>
    </div>
  );
}
