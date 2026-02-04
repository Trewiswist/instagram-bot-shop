import express from "express";

const app = express();

// Railway / Express
app.use(express.json());

// ====== ENV переменные ======
const PAGE_TOKEN = process.env.PAGE_TOKEN;   // Page Access Token
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // например: my_verify_token

// ====== Проверка webhook (GET) ======
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook подтверждён");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Ошибка подтверждения webhook");
    res.sendStatus(403);
  }
});

// ====== Приём событий (POST) ======
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Сообщение из Instagram
    if (value?.messages?.[0]) {
      const message = value.messages[0];
      const senderId = message.from;
      const text = message.text?.body;

      console.log("📩 Новое сообщение:", text);

      if (text) {
        await sendMessage(senderId, `Вы написали: ${text}`);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Ошибка webhook:", err);
    res.sendStatus(500);
  }
});

// ====== Отправка сообщения ======
async function sendMessage(recipientId, text) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_TOKEN}`;

  const payload = {
    recipient: { id: recipientId },
    message: { text }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("📤 Ответ отправлен:", data);
}

// ====== Запуск сервера ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
