const express = require('express');
const router = express.Router();
const resortController = require('../controllers/resortController');
const uploadResortImages = require('../middlewares/uploadResortImage');

router.post('/add_resort', uploadResortImages.array('images', 10), resortController.createResort);
router.get('/resorts', resortController.getAllResorts)
router.get('/total_resorts', resortController.getTotalResorts);
router.get("/resorts/:id", resortController.getResortById);
router.delete("/resorts/:id", resortController.deleteResort);
router.put('/resorts/:id', uploadResortImages.single('images'), resortController.updateResort)
router.get("/resorts/location/:location", resortController.getResortByLocation);

module.exports = router;
