const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn(
        '⚠️ [LifeFlow Mailer] EMAIL_USER or EMAIL_PASS environment variables are not set. OTP email logged to console:'
      );
      console.log(`📧 To: ${to}\n📝 Subject: ${subject}\n🔑 Message: ${text}`);
      return { success: true, simulated: true };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"LifeFlow App" <${emailUser}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ [LifeFlow Mailer] Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [LifeFlow Mailer] Error sending email to ${to}:`, error.message);
    // Log the OTP fallback to console in development so registration is not blocked
    if (text) {
      console.log(`🔑 [Fallback Console OTP for ${to}]:\n${text}`);
    }
    // Return or throw depending on design; we can return failure or let controller decide
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
