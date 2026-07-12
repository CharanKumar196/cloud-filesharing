exports.sendPasswordResetEmail = async (email, resetCode) => {
  try {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔐 PASSWORD RESET CODE`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Reset Code: ${resetCode}`);
    console.log(`⏱️  Code expires in: 1 hour`);
    console.log(`${'='.repeat(50)}\n`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};  