const router = require("express").Router();
const { requestToGroqAI } = require("../controllers/groq.controllers");

router.post("/groq-chat-bot", async (req, res) => {
  try {
    const content = req.body.content;
    const response = await requestToGroqAI(content);
    res.status(200).json({
      status: true,
      message: "Berhasil membuat permintaan ke server Groq!",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
});

module.exports = router;
