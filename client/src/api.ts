import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const isBrowser = typeof window !== 'undefined' && !window.hasOwnProperty('Capacitor');
const API_URL = isBrowser || Capacitor.getPlatform() === 'web' 
  ? 'http://localhost:5000' 
  : 'https://push-notification-server-6mdd.onrender.com'; // REPLACE with your Render URL


export const registerToken = async (token: string) => {
  try {
    await axios.post(`${API_URL}/register-token`, { token });
    console.log('Token registered on server');
  } catch (err) {
    console.error('Error registering token on server:', err);
  }
};

export const sendNotification = async (message: string) => {
  try {
    const res = await axios.post(`${API_URL}/send-notification`, { message });
    return res.data;
  } catch (err) {
    console.error('Error sending notification:', err);
    throw err;
  }
};

export const getNotifications = async () => {
  try {
    const res = await axios.get(`${API_URL}/notifications`);
    return res.data;
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};
