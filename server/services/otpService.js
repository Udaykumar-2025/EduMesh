// Mock OTP service - In production, integrate with SMS/Email providers
const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (contact, method) => {
  const otp = generateOTP();
  const otpId = `${contact}_${Date.now()}`;
  
  // Store OTP with 5-minute expiry
  otpStore.set(otpId, {
    otp,
    contact,
    method,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });

  // In production, send actual SMS/Email here
  console.log(`OTP for ${contact} (${method}): ${otp}`);
  
  // For demo purposes, always use 123456
  otpStore.set(contact, {
    otp: '123456',
    contact,
    method,
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  return { otpId, message: 'OTP sent successfully' };
};

const verifyOTP = async (contact, providedOTP) => {
  const storedData = otpStore.get(contact);
  
  if (!storedData) {
    return false;
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(contact);
    return false;
  }

  if (storedData.otp === providedOTP) {
    otpStore.delete(contact);
    return true;
  }

  return false;
};

module.exports = {
  sendOTP,
  verifyOTP
};