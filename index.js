const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// GET /webhook → проверка Meta
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

// POST /webhook → получение сообщений Instagram
app.post("/webhook", async (req, res) => {
  try {
    // читаем переменные только во время runtime
    const TG_TOKEN = process.env.TG_TOKEN;
    const TG_CHAT_ID = process.env.TG_CHAT_ID;

    const entries = req.body.entry || [];
    for (const entry of entries) {
      const messages = entry.messaging || [];
      for (const messageEvent of messages) {
        if (messageEvent.message && messageEvent.sender) {
          const text = messageEvent.message.text || "<без текста>";
          const fromId = messageEvent.sender.id;

          // отправка в Telegram
          await axios.post(
            `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
            {
              chat_id: TG_CHAT_ID,
              text: `📩 Новое сообщение в Instagram:\nОт: ${fromId}\nТекст: ${text}`,
            }
          );
        }
      }
    }
  } catch (e) {
    console.error("Ошибка при отправке в Telegram:", e.message);
  }

  res.sendStatus(200);
});

// Слушаем порт Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

