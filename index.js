const express = require('express');

const app = express();

// Railway сам передаёт порт через переменную окружения
const PORT = process.env.PORT || 8080;

// 👉 ПРОВЕРКА, ЧТО СЕРВЕР ЖИВОЙ
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// 👉 ПРОВЕРКА WEBHOOK ОТ INSTAGRAM
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'my_verify_token';

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

// 👉 ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
