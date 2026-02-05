const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;

// Проверка сервера
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Webhook для Instagram
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'my_verify_token'; // сюда позже можешь поставить свою переменную окружения

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
