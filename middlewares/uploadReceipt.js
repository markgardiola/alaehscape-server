const multer = require('multer');
const { cloudinary, CloudinaryStorage } = require('../utils/cloudinary');

const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'receipts',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const uploadReceipt = multer({ storage: receiptStorage });

module.exports = uploadReceipt;
