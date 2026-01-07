const multer = require('multer');
const { cloudinary, CloudinaryStorage } = require('../utils/cloudinary');

const resortImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'beach-resorts',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const uploadResortImages = multer({ storage: resortImageStorage });

module.exports = uploadResortImages;
