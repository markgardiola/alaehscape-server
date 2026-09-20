const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");

router.get("/destinations", destinationController.getAllDestinations);
router.get("/destinations/:slug", destinationController.getDestinationBySlug);

module.exports = router;
