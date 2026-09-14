# StudyFlow V3 — Gemini + Firebase

## What changed
- Proper `index.html` landing page.
- Upgraded student planner inputs: exam date, study hours, weak topics, days to avoid, difficulty preference.
- Gemini creates a structured JSON schedule using Firebase AI Logic.
- Backup planner still works when AI is not enabled.
- Parent/student Firebase Auth.
- Cloud Firestore plan + progress.
- Live parent progress.
- Temporary 6-digit parent pairing code.
- Today's Work Done button.
- Print / Save PDF.
- Download CSV.
- Firebase JS SDK updated to the current 12.19.0 CDN shown in Firebase docs (Sep 2026).

## Firebase
This package uses the same Firebase project/config you already created. No new Firebase project or database is required.

### AI activation
In Firebase Console, open AI Services / AI Logic and enable the Gemini Developer API provider for this project. Firebase AI Logic supports the Gemini API directly from Web apps and supports structured JSON responses through a response schema.

If App Check is enabled/enforced by your AI Logic setup, complete the App Check web setup for your deployed domain.

## GitHub
Replace the old website files in your existing `studyflow` repository with these V3 files.

Important: `index.html` is now the entry page.

## Current model
V3 requests `gemini-3.8-flash`. Firebase currently lists it as supporting structured output. If your console shows a different available fast Gemini model, change the `model:` value in `student.html`.

## Important security note
The Firebase web config is intended for client-side Firebase SDK use. Never upload Firebase Admin SDK private keys/service-account JSON files to GitHub.
