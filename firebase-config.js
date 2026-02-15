/*
  Replace placeholder values with your Firebase project settings.
  You can find these in Firebase Console:
  Project settings -> General -> Your apps -> Web app config
*/
export const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

/*
  Only these users can access the admin editor.
  Keep at least one approved email.
*/
export const adminAccess = {
  allowedEmails: ["adarshmalayath@gmail.com"],
  allowedUids: []
};

export const firebaseReady = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && !value.includes("REPLACE_ME")
);
