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
      from: `"YourApp Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset Code',
      text: `Your password reset code is: ${resetCode}\n\nThis code expires in 1 hour.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset Code</h2>
          <p>Your reset code is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${resetCode}</p>
          <p>This code expires in 1 hour.</p>
          <p>THANK YOU.</p>
          <p>Cloud-File-Sharing</p>
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
      from: `"YourApp Support" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔔 New Login to Your Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Login Detected</h2>
          <p>Hi ${userName || 'there'},</p>
          <p>Your account was just accessed:</p>
          <ul>
            <li><strong>Time:</strong> ${loginDetails.timestamp}</li>
            <li><strong>IP Address:</strong> ${loginDetails.ipAddress}</li>
            <li><strong>Device:</strong> ${loginDetails.userAgent}</li>
          </ul>
          <p>If this wasn't you, please reset your password immediately.</p>
          <p>THANK YOU.</p>
          <p>Cloud-File-Sharing</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Login notification email sent:', info.messageId);
  } catch (err) {
    console.error('Failed to send login notification email:', err.message);
  }
};

exports.sendVerificationEmail = async (email, code) => {
  try {
    const info = await transporter.sendMail({
      from: `"YourApp Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
          <p>THANK YOU.</p>
          <p>Cloud-File-Sharing</p>
        </div>
      `,
    });
    console.log('Verification email sent:', info.messageId);
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }
};

exports.sendAccountLockedEmail = async (email, minutes = 20) => {
  try {
    const info = await transporter.sendMail({
      from: `"YourApp Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your account has been temporarily locked',
      text: `Your account was locked for ${minutes} minutes due to multiple failed login attempts.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Account Locked</h2>
          <p>We noticed multiple failed login attempts on your account.</p>
          <p>Your account has been locked for <strong>${minutes} minutes</strong> as a security measure.</p>
          <p>If this wasn't you, please change your password once the lock period ends.</p>
          <p>THANK YOU.</p>
          <p>Cloud-File-Sharing</p>
        </div>
      `,
    });
    console.log('Lockout email sent:', info.messageId);
  } catch (err) {
    console.error('Failed to send lockout email:', err.message);
  }
};