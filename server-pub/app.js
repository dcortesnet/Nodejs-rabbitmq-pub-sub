const express = require('express');
const app = express();
const { v4 } = require('uuid');
const PORT = 3000;
const amqp = require('amqplib');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
let rabbitMQConnection;
const queueName = "MessageQueue";

app.post('/messages', async (req, res) => {
  try {

    if (!req.body?.message) {
      return res.status(400).json({
        detail: "The message property is required"
      });
    }

    const message = {
      id: v4(),
      message: req.body.message,
      date: new Date(),
    };

    const channel = await rabbitMQConnection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log(`Publishing an Event using RabbitMQ to :${req.body.message}`);
    await channel.close();
    return res.json({
      detail: 'Publishing an Event using RabbitMQ successful',
    });
  } catch (error) {
    return res.status(500).json({
      detail: error.message
    });
  }
});

amqp.connect('amqp://localhost').then(connection => {
  rabbitMQConnection = connection;
  app.listen(PORT, () => {
    console.log(` 😀 server on port ${PORT}  `);
  });
});

