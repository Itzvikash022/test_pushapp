import axios from 'axios';

// CHANGE THIS to your laptop's local IP (e.g., http://192.168.1.15:5000) 
// for testing on physical Android devices over the same Wi-Fi.
const API_URL = 'http://10.0.2.2:5000'; 


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
