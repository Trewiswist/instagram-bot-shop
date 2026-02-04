import express from "express";
import fetch from "node-fetch";

const app = express();

// ===== НАСТРОЙКИ =====
const VERIFY_TOKEN = "my_verify_token"; // ТОЧНО такой же, как в Meta
const PAGE_TOKEN = process.env.PAGE_TOKEN; // Instagram Access Token
// =====================

app.use(express.json());

// 🔹 Проверка Webhook (ОЧЕНЬ ВАЖНО)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook подтверждён");
    return res.status(200).send(challenge);
  }

  console.log("❌ Ошибка подтверждения webhook");
  return res.sendStatus(403);
});

// 🔹 Приём сообщений из Instagram
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const messaging = entry?.messaging?.[0];

  if (!messaging) {
    return res.sendStatus(200);
  }

  const senderId = messaging.sender.id;
  const messageText = messaging.message?.text;

  console.log("📩 Новое сообщение:", messageText);

  // 🔹 Первый автоответ
  if (messageText) {
    await sendMessage(senderId, "Здравствуйте 👋\nПосмотрите каталог товаров 🛍️");
  }

  res.sendStatus(200);
});

// 🔹 Отправка сообщения в Instagram
async function sendMessage(recipientId, text) {
  const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`;

  const body = {
    recipient: { id: recipientId },
    message: { text }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("✅ Ответ отправлен:", data);
  } catch (error) {
    console.error("❌ Ошибка отправки:", error);
  }
}

// 🔹 Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});

