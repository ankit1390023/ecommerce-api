const transporter = require('../config/email');

exports.sendMessageToSuperAdmin = async (req, res, next) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required'
            });
        }

        const emailHTML = `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">📧 Message from Admin</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>👤 From:</strong> ${req.user.name}</p>
          <p><strong>📧 Email:</strong> ${req.user.email}</p>
          <p><strong>🎭 Role:</strong> ${req.user.role}</p>
        </div>
        <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px;">
          <h3 style="color: #667eea; margin-top: 0;">Subject: ${subject}</h3>
          <div style="line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          <p>📅 Sent: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          <p>💼 E-Commerce Admin Portal</p>
        </div>
      </div>
    `;

        await transporter.sendMail({
            from: `"E-Commerce Admin" <${process.env.SMTP_USER}>`,
            to: process.env.SUPER_ADMIN_EMAIL,
            subject: `[ADMIN QUERY] ${subject}`,
            html: emailHTML,
            replyTo: req.user.email
        });

        res.json({
            success: true,
            message: 'Message sent to Super Admin successfully'
        });
    } catch (error) {
        console.error('❌ Email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
};