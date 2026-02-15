# Firebase Setup For Admin Login + Live Editing

This portfolio now supports:
- public read from Firestore (for site content)
- admin login on `admin.html` with Google Sign-In only
- content editing and saving through Firestore

## 1. Create Firebase project
1. Open Firebase Console.
2. Create a project (or use existing).
3. Add a **Web App**.
4. Copy config values into `firebase-config.js`.

## 2. Enable Authentication providers
In Firebase Console -> Authentication -> Sign-in method:
1. Enable **Google**.
2. Set a support email for Google provider.
3. In Authentication -> Settings -> Authorized domains, add:
   - `adarshmalayath.github.io`
4. Use your admin Google account:
   - `adarshmalayath@gmail.com`

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
- Google Sign-In tokens are validated by Firebase Authentication over HTTPS/TLS.
