/*
  Replace placeholder values with your Firebase project settings.
  You can find these in Firebase Console:
  Project settings -> General -> Your apps -> Web app config
*/
export const firebaseConfig = {
  apiKey: "AIzaSyDm9UwhJO7PE4bpb1Xk1fNFpD2yNJIKwsI",
  authDomain: "portfolio-4e1c6.firebaseapp.com",
  projectId: "portfolio-4e1c6",
  storageBucket: "portfolio-4e1c6.firebasestorage.app",
  messagingSenderId: "620723089488",
  appId: "1:620723089488:web:02872c61ba6f56ff582155",
  measurementId: "G-PDE2CQNDC0"
};

/*
  Only these users can access the admin editor.
  Use UID allowlist for strongest control.
*/
export const adminAccess = {
  allowedEmails: ["adarshmalayath@gmail.com", "adarshmalayath@icloud.com"],
  allowedUids: []
};

export const firebaseReady = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && !value.includes("REPLACE_ME")
);
