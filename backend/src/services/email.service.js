const nodemailer = require('nodemailer');

/**
 * Gửi mã OTP khôi phục mật khẩu qua Email
 * @param {string} toEmail - Địa chỉ email người nhận
 * @param {string} otp - Mã OTP 6 số
 * @param {string} fullName - Tên người dùng
 */
async function sendOtpEmail(toEmail, otp, fullName = 'Quý khách') {
  const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

  console.log('====================================================');
  console.log(`🔑 [AUTH OTP] Mã xác thực khôi phục mật khẩu cho ${toEmail}: ${otp}`);
  console.log('====================================================');

  if (!hasSmtpConfig) {
    console.log('ℹ️ [Nodemailer] Không phát hiện cấu hình SMTP trong .env. OTP đã được log ở console để phát triển.');
    return {
      success: true,
      delivered: false,
      message: 'Mã OTP đã được tạo (môi trường phát triển).',
      devOtp: otp // Có thể gửi devOtp trong môi trường dev nếu cần
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true cho port 465, false cho 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 30px 20px; background-color: #ffffff; color: #1d1d1f; border-radius: 16px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 24px; font-weight: 700; color: #d70018; margin: 0;">Apple Store</h2>
          <p style="font-size: 14px; color: #86868b; margin-top: 4px;">Khôi phục quyền truy cập tài khoản</p>
        </div>
        <div style="background-color: #f5f5f7; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 15px; margin-bottom: 12px; color: #1d1d1f;">Xin chào <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; color: #6e6e73; margin-bottom: 20px; line-height: 1.5;">
            Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để hoàn tất:
          </p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #d70018; background: #ffffff; border: 1px dashed #d70018; display: inline-block; padding: 12px 28px; border-radius: 8px;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #86868b; margin-top: 16px; margin-bottom: 0;">
            Mã xác thực có hiệu lực trong vòng <strong>10 phút</strong>.
          </p>
        </div>
        <p style="font-size: 12px; color: #86868b; line-height: 1.5; text-align: center;">
          Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ của chúng tôi để được trợ giúp.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Apple Store Support'}" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `[Apple Store] ${otp} là mã xác thực khôi phục mật khẩu của bạn`,
      html: htmlContent
    });

    console.log(`✉️ Email OTP đã được gửi thành công đến: ${toEmail}`);
    return { success: true, delivered: true };
  } catch (error) {
    console.error('❌ Lỗi khi gửi email qua Nodemailer:', error);
    // Vẫn log OTP để không block người dùng nếu SMTP lỗi
    return { success: true, delivered: false, error: error.message };
  }
}

module.exports = {
  sendOtpEmail
};
