const express = require("express");
const router = express.Router();
const optionalAuth = require("../middlewares/optionalAuth");
const chatbotController = require("../controllers/chatbotController");

router.post("/chatbot/message", optionalAuth, chatbotController.sendMessage);

module.exports = router;
