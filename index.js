const express = require("express");
const app = express();

app.use(express.json());

// GET /webhook → проверка Meta
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "verify123";
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
app.post("/webhook", (req, res) => {
  console.log("Новое сообщение Instagram:", JSON.stringify(req.body, null, 2));
  // пока просто логируем сообщения в консоль
  res.sendStatus(200);
});

// Слушаем порт Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
