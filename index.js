// index.js — минимальный рабочий Instagram-бот (Node.js)

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PAGE_TOKEN = process.env.PAGE_TOKEN; // Page Access Token твоей страницы
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "12345"; // любой маркер проверки

// Проверка webhook при GET-запросе (Meta)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook подтверждён!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Приём сообщений от Instagram
app.post('/webhook', (req, res) => {
    const data = req.body;

    // Обязательно отправляем 200, чтобы Meta не считала webhook мёртвым
    res.sendStatus(200);

    if (data.object === 'instagram') {
        data.entry.forEach(entry => {
            if (!entry.messaging) return;

            entry.messaging.forEach(event => {
                const senderId = event.sender.id;
                const text = event.message?.text;

                if (text) {
                    // Минимальный автоответ
                    sendMessage(senderId, "Привет 👋 Посмотрите каталог в профиле");
                }
            });
        });
    }
});

// Функция отправки сообщения
function sendMessage(recipientId, messageText) {
    axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_TOKEN}`, {
        messaging_type: "RESPONSE",
        recipient: { id: recipientId },
        message: { text: messageText }
    }).catch(err => console.log("Ошибка отправки:", err.response?.data || err.message));
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
