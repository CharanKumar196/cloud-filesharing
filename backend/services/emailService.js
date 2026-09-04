const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cloud File Sharing" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      text: `Your password reset code is: ${resetCode}\n\nThis code will expire in 1 hour. If you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the code below to proceed:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #007bff;">${resetCode}</p>
          <p style="color: #666;">This code expires in <strong>1 hour</strong>.</p>
          <p style="color: #999; font-size: 12px;">Didn't request this? Your account is still secure. Ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">Cloud File Sharing Team</p>
        </div>
      `,
    });

    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

exports.sendLoginNotificationEmail = async (userEmail, userName, loginDetails) => {
  try {
    const mailOptions = {
      from: `"Cloud File Sharing" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔔 New Login to Your Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Login Detected</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Your account was just accessed. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginDetails.timestamp}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>IP Address:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginDetails.ipAddress}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Device:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${loginDetails.userAgent}</td>
            </tr>
          </table>
          <p><strong>Don't recognize this activity?</strong></p>
          <p>If this login wasn't you, we recommend changing your password immediately to keep your account secure.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Cloud File Sharing Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Login notification email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send login notification email:', err.message);
  }
};

exports.sendVerificationEmail = async (email, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cloud File Sharing" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      text: `Your verification code is: ${code}\nThis code expires in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Welcome! To get started, please verify your email address using the code below:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #007bff;">${code}</p>
          <p style="color: #666;">This code expires in <strong>5 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you didn't create this account, please disregard this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">Cloud File Sharing Team</p>
        </div>
      `,
    });
    console.log('✅ Verification email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send verification email:', err.message);
  }
};

exports.sendAccountLockedEmail = async (email, minutes = 20) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cloud File Sharing" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Account Security Alert',
      text: `Your account has been temporarily locked for ${minutes} minutes due to multiple failed login attempts.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Account Temporarily Locked</h2>
          <p>We detected multiple unsuccessful login attempts on your account. To protect your security, your account has been temporarily locked.</p>
          <p><strong>Lock Duration:</strong> ${minutes} minutes</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Your account will automatically unlock after ${minutes} minutes</li>
            <li>Try logging in again after the lock period expires</li>
            <li>If you're having trouble remembering your password, you can reset it using the "Forgot Password" option</li>
          </ul>
          <p style="color: #d9534f;"><strong>Is this suspicious?</strong></p>
          <p style="color: #666;">If you didn't attempt these logins, we recommend resetting your password once your account is unlocked. This will help keep your data safe.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">Cloud File Sharing Team</p>
        </div>
      `,
    });
    console.log('✅ Account lock notification sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send account lock email:', err.message);
  }
};