import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import admin from './firebase-admin.js';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Schemas
const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const Token = mongoose.model('Token', tokenSchema);

const notificationSchema = new mongoose.Schema({
  title: String,
  body: String,
  timestamp: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// In-memory fallback if DB is not connected
let tokensArr = [];
let notificationsArr = [];

// APIs

// 1. POST /register-token
app.post('/register-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).send({ error: 'Token is required' });

  try {
    // Try to save to DB if connected
    if (mongoose.connection.readyState === 1) {
      await Token.findOneAndUpdate({ token }, { token }, { upsid: true, new: true, upsert: true });
    } else {
      if (!tokensArr.includes(token)) tokensArr.push(token);
    }
    console.log('Token registered:', token);
    res.status(200).send({ message: 'Token registered successfully' });
  } catch (err) {
    console.error('Error registering token:', err);
    res.status(500).send({ error: 'Failed to register token' });
  }
});

// 2. POST /send-notification
app.post('/send-notification', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).send({ error: 'Message is required' });

  const payload = {
    notification: {
      title: 'Broadcast',
      body: message,
    },
    topic: 'all-users',
    data: {
      timestamp: new Date().toISOString()
    }
  };

  try {
    // Save notification to history
    const notificationData = { title: 'Broadcast', body: message, timestamp: new Date() };
    if (mongoose.connection.readyState === 1) {
      await Notification.create(notificationData);
    } else {
      notificationsArr.unshift(notificationData);
    }

    // Send push notification via FCM
    if (admin.apps.length > 0) {
      const response = await admin.messaging().send(payload);
      console.log('Successfully sent message:', response);
      res.status(200).send({ message: 'Notification sent successfully', response });
    } else {
      console.warn('Firebase not initialized. Notification recorded in history but not sent.');
      res.status(200).send({ message: 'Notification recorded (Firebase not initialized)', historyOnly: true });
    }
  } catch (err) {
    console.error('Error sending notification:', err);
    res.status(500).send({ error: 'Failed to send notification' });
  }
});

// 3. GET /notifications
app.get('/notifications', async (req, res) => {
  try {
    let history = [];
    if (mongoose.connection.readyState === 1) {
      history = await Notification.find().sort({ timestamp: -1 });
    } else {
      history = notificationsArr;
    }
    res.status(200).send(history);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).send({ error: 'Failed to fetch notifications' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
