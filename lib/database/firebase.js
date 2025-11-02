const admin = require("firebase-admin");

if (!process.env.VERCEL) require("dotenv").config();
const credential = JSON.parse(process.env.FIREBASE_CREDENTIAL);

admin.initializeApp({
  credential: admin.credential.cert(credential),
});

const db = admin.firestore();
module.exports = { db };
