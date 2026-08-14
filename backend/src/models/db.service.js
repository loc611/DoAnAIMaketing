require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Tạo một phiên chat mới
 */
const createChatSession = async (userId = null) => {
  return await prisma.chatSession.create({
    data: { userId }
  });
};

/**
 * Lưu tin nhắn vào Database
 */
const saveChatMessage = async (sessionId, sender, text, isError = false) => {
  return await prisma.chatMessage.create({
    data: {
      sessionId,
      sender,
      text,
      isError
    }
  });
};

/**
 * Lấy lịch sử của một phiên chat
 */
const getChatHistory = async (sessionId) => {
  return await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' }
  });
};

module.exports = {
  prisma,
  createChatSession,
  saveChatMessage,
  getChatHistory
};
