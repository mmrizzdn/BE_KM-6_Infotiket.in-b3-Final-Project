const multer = require("multer");

const generateFileFilter = (mimeTypes, maxFileSize) => {
  return (req, file, callback) => {
    const fileSize = file.size;

    if (!mimeTypes.includes(file.mimetype)) {
      const error = new Error(
        `Hanya ${mimeTypes} yang diperbolehkan untuk diunggah`
      );
      return callback(error, false);
    }

    if (fileSize > maxFileSize) {
      const err = new Error("Ukuran file terlalu besar");
      return callback(err, false);
    }

    callback(null, true);
  };
};

module.exports = {
  image: multer({
    fileFilter: generateFileFilter(
      ["image/png", "image/jpg", "image/jpeg"],
      2000000
    ),
    onError: (error, next) => {
      next(error);
    },
  }),
};
