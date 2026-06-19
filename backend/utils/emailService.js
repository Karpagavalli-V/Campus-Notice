const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a high-priority notice email to a list of recipients
 */
exports.sendHighPriorityNoticeEmail = async (recipients, notice) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "your_gmail@gmail.com") {
    console.log("[EmailService] Email credentials not configured. Skipping email.");
    return;
  }
  try {
    const transporter = createTransporter();
    const emailList = recipients.filter(Boolean);
    if (emailList.length === 0) return;

    await transporter.sendMail({
      from: `"Campus Notice 🎓" <${process.env.EMAIL_USER}>`,
      bcc: emailList.join(","),
      subject: `🚨 High Priority Notice: ${notice.title}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 1.5rem;">📢 Campus Notice</h1>
            <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-top: 8px; display: inline-block;">HIGH PRIORITY</span>
          </div>
          <div style="background: white; padding: 32px 24px;">
            <h2 style="color: #0f172a; font-size: 1.3rem; margin-bottom: 12px;">${notice.title}</h2>
            <p style="color: #475569; line-height: 1.6; font-size: 0.95rem;">${notice.content}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <div style="display: flex; gap: 16px; flex-wrap: wrap;">
              <span style="color: #64748b; font-size: 0.85rem;">📁 Dept: <strong>${notice.department || "General"}</strong></span>
              <span style="color: #64748b; font-size: 0.85rem;">📅 Expires: <strong>${notice.expiryDate ? new Date(notice.expiryDate).toLocaleDateString() : "N/A"}</strong></span>
            </div>
            <a href="${process.env.FRONTEND_URL}/notice/${notice._id}" style="display: inline-block; margin-top: 24px; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 0.95rem;">View Notice →</a>
          </div>
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
            Campus Hub · You received this because you follow the author.
          </div>
        </div>
      `,
    });
    console.log(`[EmailService] High-priority email sent to ${emailList.length} recipients.`);
  } catch (error) {
    console.error("[EmailService] Failed to send email:", error.message);
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, resetUrl, name) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "your_gmail@gmail.com") {
    console.log("[EmailService] Email credentials not configured. Skipping password reset email.");
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Campus Notice 🎓" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Campus Notice Password",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 1.5rem;">🔐 Password Reset</h1>
          </div>
          <div style="background: white; padding: 32px 24px;">
            <p style="color: #475569;">Hi <strong>${name || "there"}</strong>,</p>
            <p style="color: #475569; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
            <a href="${resetUrl}" style="display: inline-block; margin-top: 16px; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 1rem;">Reset Password →</a>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });
    console.log("[EmailService] Password reset email sent to:", email);
  } catch (error) {
    console.error("[EmailService] Failed to send password reset email:", error.message);
  }
};
