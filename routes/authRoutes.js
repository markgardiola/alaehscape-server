const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Registration (SMS OTP verification)
router.post("/register/request-otp", authController.requestRegistrationOtp);
router.post("/register/resend-otp", authController.resendRegistrationOtp);
router.post("/register/verify-otp", authController.verifyRegistrationOtp);

// Password recovery (SMS or email OTP, user's choice)
router.post("/password-reset/lookup", authController.lookupRecoveryOptions);
router.post(
  "/password-reset/request-otp",
  authController.requestPasswordResetOtp,
);
router.post(
  "/password-reset/resend-otp",
  authController.resendPasswordResetOtp,
);
router.post(
  "/password-reset/verify-otp",
  authController.verifyPasswordResetOtp,
);
router.post("/password-reset/reset", authController.resetPassword);

// Login
router.post("/login", authController.login);
router.post("/admin-login", authController.adminLogin);

module.exports = router;
