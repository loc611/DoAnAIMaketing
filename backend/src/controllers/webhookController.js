const prisma = require('../config/prisma');

const handleSepayWebhook = async (req, res) => {
  try {
    // Trong thực tế, bạn cần verify signature hoặc API Key từ SePay gửi qua Headers
    // const apiKey = req.headers['authorization'];
    // if (apiKey !== 'BEARER YOUR_SEPAY_KEY') return res.status(401).json({ error: 'Unauthorized' });

    // Cấu trúc payload mẫu từ SePay (hoặc tự định nghĩa để test)
    const { orderId, amount, transferContent } = req.body;

    let targetOrderId = orderId;

    // Nếu gửi qua transferContent (vd: "Thanh toan don hang {orderId}")
    if (!targetOrderId && transferContent) {
      const match = transferContent.match(/don hang ([A-Za-z0-9\-]+)/i);
      if (match && match[1]) {
        targetOrderId = match[1];
      }
    }

    if (!targetOrderId) {
      return res.status(400).json({ error: 'Missing orderId' });
    }

    // Tìm order
    const order = await prisma.order.findUnique({
      where: { id: targetOrderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Cập nhật trạng thái thanh toán và trạng thái đơn hàng
    const updatedOrder = await prisma.order.update({
      where: { id: targetOrderId },
      data: {
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING', // Chuyển từ PENDING sang PROCESSING
      }
    });

    return res.status(200).json({ success: true, message: 'Order paid successfully', order: updatedOrder });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleSepayWebhook
};
