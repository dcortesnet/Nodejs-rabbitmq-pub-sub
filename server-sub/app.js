const express = require('express');
const app = express();
const PORT = 3001;
const amqp = require('amqplib');

let rabbitMQConnection;
const queueName = "MessageQueue";
const messagesStorage = [];

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/messages', (req, res) => {
  try {
    return res.json({ messages: messagesStorage });
  } catch (error) {
    return res.status(500).json({
      detail: error.message
    });
  }
});

async function listenMessages() {
  const channel = await rabbitMQConnection.createChannel();
  await channel.assertQueue(queueName, { durable: false });
  channel.consume(queueName, (message) => {
    if (message !== null) {
      const receivedJSON = JSON.parse(message.content.toString());
      console.log(`Capturing an Event using RabbitMQ to:`, receivedJSON);
      messagesStorage.push(receivedJSON);
      channel.ack(message);
    }
  });
}

amqp.connect('amqp://localhost').then(async (connection) => {
  rabbitMQConnection = connection;
  listenMessages();
  app.listen(PORT, () => {
    console.log(` 😀 server on port ${PORT}  `);
  });
});
