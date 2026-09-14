# Firebase setup

## 1. Create Firebase project
Open Firebase Console and create a project.

## 2. Add a Web App
Project settings → Your apps → Web.
Copy the Firebase configuration object and replace the placeholders in `firebase-config.js`.

Do NOT put Firebase Admin SDK/service-account private keys in this project.

## 3. Enable Authentication
Firebase Console → Authentication → Sign-in method → enable:
- Email/Password

## 4. Create Firestore
Firebase Console → Firestore Database → Create database.

For initial testing, you can create it in locked/production mode and then paste `firestore.rules` into:
Firestore Database → Rules.

The rules are intentionally restrictive:
- students can write their own plan
- parents can read a plan only through an explicit parent/student link
- parent connection is done using a temporary 6-digit code

Review security rules before any public launch.

## 5. Test locally
Because these pages use JavaScript modules and Firebase, serve the folder over HTTP instead of opening an HTML file directly.

Example with Python:
`python -m http.server 8080`

Then open:
`http://localhost:8080/student.html`
and
`http://localhost:8080/parent.html`

## 6. Test the connection
1. Create a student account.
2. Generate a parent code in Student App.
3. Create a parent account in Parent App.
4. Enter the code.
5. Generate/complete study tasks as the student.
6. The parent dashboard receives the cloud-saved plan and progress.

## 7. Deploy to Firebase Hosting
Install Firebase CLI:
`npm install -g firebase-tools`

Then:
`firebase login`
`firebase init hosting`
Choose this existing project and select the current folder as the public directory.

Deploy:
`firebase deploy`

## 8. Before launch
Add proper privacy policy/terms, rate limiting, abuse protection, App Check, and stronger invite/link lifecycle controls. Also move the AI API call to a trusted backend/serverless function so no model API secret is exposed in the browser.
