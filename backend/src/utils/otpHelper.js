const crypto = require("crypto");
const bcrypt = require("bcrypt");
const redisClient = require("../config/redis");

const generateAndStoreOtp = async (userId, type) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, 8);
  const key = `otp:${type}:${userId}`;
  
  await redisClient.set(key, hashedOtp);
  await redisClient.expire(key, 600); // 10 minutes
  
  return otp;
};

const verifyOtp = async (userId, type, plainOtp) => {
  const key = `otp:${type}:${userId}`;
  const hashedOtp = await redisClient.get(key);
  
  if (!hashedOtp) {
    return { valid: false, reason: "expired" };
  }
  
  const isMatch = await bcrypt.compare(plainOtp, hashedOtp);
  
  if (isMatch) {
    await redisClient.del(key);
    return { valid: true };
  }
  
  return { valid: false, reason: "invalid" };
};

const canResendOtp = async (userId, type) => {
  const key = `otp:${type}:${userId}`;
  const ttl = await redisClient.ttl(key);
  
  // If TTL > 540, it was sent less than 60 seconds ago
  if (ttl > 540) {
    return false;
  }
  
  return true;
};

module.exports = {
  generateAndStoreOtp,
  verifyOtp,
  canResendOtp
};
