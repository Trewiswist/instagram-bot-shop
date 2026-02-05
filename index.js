import express from "express";

const app = express();
app.use(express.json());

// ===== Переменные окружения =====
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "my_verify_token";

// ===== Проверка webhook (Facebook / Instagram) =====
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

// ===== Приём сообщений (POST) =====
app.post("/webhook", (req, res) => {
  console.log("📩 Входящее событие:", JSON.stringify(req.body, null, 2));
  // Пока просто логируем события
  res.sendStatus(200);
});

// ===== Запуск сервера =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
