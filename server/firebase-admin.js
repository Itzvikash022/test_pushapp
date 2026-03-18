import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
let resolvedPath = serviceAccountPath;

if (serviceAccountPath && !path.isAbsolute(serviceAccountPath)) {
  resolvedPath = path.resolve(serviceAccountPath);
}

if (resolvedPath && fs.existsSync(resolvedPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized');
} else {
  console.warn('Firebase Service Account file not found at:', serviceAccountPath);
  console.warn('Push notifications will NOT work until you provide the service account key.');
}

export default admin;
