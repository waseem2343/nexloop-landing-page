# Firebase Authentication Setup Guide

This project now uses **Firebase Authentication** to secure the admin console. Follow these steps to set up Firebase and configure authentication.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or use an existing one
3. Enter your project name (e.g., "Nexloop CRM")
4. Accept the terms and create the project
5. Wait for the project to be ready

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** from the left sidebar
2. Click **"Get Started"**
3. Select **Email/Password** as the authentication method
4. Enable it and save

## 3. Create Admin Users

1. In the Authentication section, go to the **Users** tab
2. Click **"Add user"**
3. Enter the admin email (e.g., `admin@nexloop.com`)
4. Set a strong password
5. Click **"Add user"**
6. Repeat for other admin accounts as needed

## 4. Get Firebase Credentials

1. Go to **Project Settings** (gear icon at top-left)
2. Click the **"General"** tab
3. Scroll down to find your **Firebase SDK snippet**
4. Copy the configuration object with these fields:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## 5. Configure Environment Variables

1. Rename `.env.local.example` to `.env.local`
2. Fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_from_firebase
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. Save the file (it's in `.gitignore`, so it won't be committed)

## 6. Start the Development Server

```bash
npm run dev
```

## 7. Test the Login

1. Open `http://localhost:5173/admin/login`
2. Sign in with one of the admin accounts created in Firebase
3. You should be redirected to the admin dashboard

## Firebase Security Rules (Optional)

If you plan to use Firestore or Realtime Database, set up security rules to protect your data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### "Firebase config is missing"
- Check that `.env.local` exists with all required fields
- Restart the dev server after adding environment variables

### "Invalid credentials"
- Verify the user exists in Firebase Authentication > Users
- Check that Email/Password authentication is enabled in Firebase

### "Too many requests"
- Firebase has rate limiting. Wait a few minutes before trying again.

## Production Deployment

When deploying to production:

1. Create a separate Firebase project or configure production environment variables
2. Update your `VITE_FIREBASE_*` variables for production
3. Consider enabling additional security features like reCAPTCHA
4. Enable Firebase Security Rules for database access

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
