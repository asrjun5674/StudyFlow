# StudyFlow — Firebase Edition

This edition adds real accounts and cloud syncing.

## Included
- `student.html` — student login, remembered login, plan creation/editing, cloud saving, progress tracking, temporary parent-link code.
- `parent.html` — separate parent login, remembered login, 6-digit student connection code, live Firestore progress dashboard.
- `firebase-config.js` — add your Firebase Web App config here.
- `firestore.rules` — starter rules that restrict plan access and parent links.
- `firebase.json` — Firebase Hosting config.
- `SETUP.md` — step-by-step setup.

## Important
This is Firebase-ready, but it cannot connect to your Firebase project until you create/select your Firebase project and paste its Web App config into `firebase-config.js`.

The Firebase web SDK uses browser-local auth persistence here, so returning users can remain signed in on that browser. Firebase Authentication supports email/password accounts, and Firestore Security Rules should be used with Authentication to secure cloud data.

## Data model
`users/{uid}` — account role (student/parent)
`plans/{studentUid}` — student's plan/progress
`pairingCodes/{6digit}` — temporary student-created code
`links/{studentUid_parentUid}` — parent/student relationship

## Next product step
Once this edition is running, add the real AI planner through a backend/API (not a secret API key inside HTML), then add:
- AI scheduling by difficulty, exam date and daily hours
- rescheduling when a portion is missed
- multiple children per parent
- notifications
- streaks and rewards
- teacher/school mode
