const imageKit = require("imagekit");

const { IMAGE_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PRIVATE_URL } =
  process.env;

module.exports = new imageKit({
  publicKey: IMAGE_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_PRIVATE_URL,
});
