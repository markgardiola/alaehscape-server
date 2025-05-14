const express = require('express');
const router = express.Router();
const multer = require('multer');
const resortController = require('../controllers/resortController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/add_resort', upload.single('image'), resortController.createResort);
router.get('/resorts', resortController.getAllResorts)
router.get('/total_resorts', resortController.getTotalResorts);
router.get("/resorts/:id", resortController.getResortById);
router.delete("/resorts/:id", resortController.deleteResort);
router.put('/resorts/:id', upload.single('image'), resortController.updateResort)
router.get("/resorts/location/:location", resortController.getResortByLocation);

module.exports = router;
