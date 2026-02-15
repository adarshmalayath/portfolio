# Firebase Setup For Admin Login + Live Editing

This portfolio now supports:
- public read from Firestore (for site content)
- admin login on `admin.html` with Google or Apple
- content editing and saving through Firestore

## 1. Create Firebase project
1. Open Firebase Console.
2. Create a project (or use existing).
3. Add a **Web App**.
4. Copy config values into `firebase-config.js`.

## 2. Enable Authentication providers
In Firebase Console -> Authentication -> Sign-in method:
1. Enable **Google**.
2. Enable **Apple**.
3. For Apple, complete Apple Developer setup (Service ID + redirect settings) as required by Firebase.

## 3. Enable Firestore
1. Create Firestore database (Production mode).
2. Create document path:
   - Collection: `portfolio`
   - Document: `siteContent`
3. You can leave it empty initially; `admin.html` can save defaults.

## 4. Firestore security rules
Use rules like this (replace email if needed):

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
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
- optional `adminAccess.allowedUids`

## 6. Deploy
Push to GitHub. GitHub Pages will serve:
- public site: `index.html`
- admin page: `admin.html`

## Notes
- Firebase web API keys are not secrets; rules protect data.
- If Apple sign-in fails, verify Apple provider configuration in Firebase and Apple Developer portal.
