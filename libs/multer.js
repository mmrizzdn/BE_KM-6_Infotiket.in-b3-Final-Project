const multer = require("multer");
const path = require("path");

// Validasi maximum file size
const generateFileFilter = (mimeTypes, maxFileSize) => {
  return (req, file, callback) => {
    const fileSize = file.size;

    if (!mimeTypes.includes(file.mimetype)) {
      const error = new Error(`Only ${mimeTypes} are allowed to upload`);
      return callback(error, false);
    }

    if (fileSize > maxFileSize) {
      const err = new Error("Maximum file size extended!");
      return callback(err, false);
    }

    callback(null, true);
  };
};

module.exports = {
  image: multer({
    fileFilter: generateFileFilter(
      ["image/png", "image/jpg", "image/jpeg"],
      2000000 // Max upload image 2 MB!
    ),
    onError: (error, next) => {
      next(error);
    },
  }),
};
