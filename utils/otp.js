const bcrypt = require("bcrypt");

/** Generates a cryptographically random 6-digit numeric OTP. */
const generateOtp = () => {
  const n = require("crypto").randomInt(0, 1000000);
  return n.toString().padStart(6, "0");
};

const hashOtp = (otp) => bcrypt.hash(otp, 10);
const compareOtp = (otp, hash) => bcrypt.compare(otp, hash);

/**
 * Normalizes common Philippine mobile number formats (+639171234567,
 * 639171234567, 09171234567, 9171234567) to the local 09XXXXXXXXX form
 * Semaphore's API expects. Returns null if it doesn't look like a valid
 * PH mobile number.
 */
const normalizePhilippinePhone = (input) => {
  const digits = String(input || "").replace(/\D/g, "");

  if (digits.startsWith("63") && digits.length === 12) {
    return "0" + digits.slice(2);
  }
  if (digits.startsWith("09") && digits.length === 11) {
    return digits;
  }
  if (digits.startsWith("9") && digits.length === 10) {
    return "0" + digits;
  }
  return null;
};

/** "johndoe@gmail.com" -> "jo****e@gmail.com" */
const maskEmail = (email) => {
  const [local, domain] = String(email).split("@");
  if (!domain) return email;
  if (local.length <= 3) {
    return `${local[0]}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
  }
  return `${local.slice(0, 2)}${"*".repeat(local.length - 3)}${local.slice(-1)}@${domain}`;
};

/** "09171234567" -> "0917****567" */
const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 4)}${"*".repeat(phone.length - 7)}${phone.slice(-3)}`;
};

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  normalizePhilippinePhone,
  maskEmail,
  maskPhone,
};
