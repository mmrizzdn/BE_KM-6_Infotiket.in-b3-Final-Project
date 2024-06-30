require("dotenv").config();
const { Groq } = require("groq-sdk");
const safeStringify = require("json-stringify-safe");
const translate = require("translate-google");

const { API_KEY_GROQ } = process.env;

const groq = new Groq({
  apiKey: API_KEY_GROQ,
  dangerouslyAllowBrowser: true,
});

module.exports = {
  requestToGroqAI: async (content) => {
    try {
      const reply = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content,
          },
        ],
        model: "llama3-8b-8192",
      });

      const translatedContent = await translate(
        reply.choices[0].message.content,
        { to: "id" }
      );

      return translatedContent;
    } catch (error) {
      console.error(safeStringify(error, null, 2));
      throw error;
    }
  },
};
