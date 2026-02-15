# Firebase Setup For Admin Login + Live Editing

This portfolio now supports:
- public read from Firestore (for site content)
- admin login on `admin.html` with Email + Password
- content editing and saving through Firestore

## 1. Create Firebase project
1. Open Firebase Console.
2. Create a project (or use existing).
3. Add a **Web App**.
4. Copy config values into `firebase-config.js`.

## 2. Enable Authentication providers
In Firebase Console -> Authentication -> Sign-in method:
1. Enable **Email/Password**.
2. In Authentication -> Users, create your admin user:
   - Email: `adarshmalayath@icloud.com`
   - Password: choose a strong password
3. Disable Google/Apple providers if you do not want them.

## 3. Enable Firestore
1. Create Firestore database (Production mode).
2. Create document path:
   - Collection: `portfolio`
   - Document: `siteContent`
3. You can leave it empty initially; `admin.html` can save defaults.

## 4. Firestore security rules
Use rules like this (replace with your Firebase Auth UID and email):

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.uid in ['REPLACE_WITH_YOUR_UID']
        && request.auth.token.email in ['adarshmalayath@gmail.com'];
    }

    match /portfolio/siteContent {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## 5. Configure admin allowlist in frontend
Update `firebase-config.js`:
- `adminAccess.allowedEmails`
- `adminAccess.allowedUids` (recommended)

## 6. Deploy
Push to GitHub. GitHub Pages will serve:
- public site: `index.html`
- admin page: `admin.html`

## Notes
- Firebase web API keys are not secrets; rules protect data.
- Passwords are never stored in this site code. Firebase Auth handles hashing and verification server-side.
