# StudyFlow V3 — what you do

1. Download the V3 ZIP.
2. Extract it.
3. In GitHub → `studyflow`, replace the existing website files with the V3 files.
4. Make sure `index.html` is in the repository root.
5. Open your GitHub Pages URL again. It should now show the StudyFlow home screen.
6. In Firebase Console, enable Firebase AI Logic / Gemini Developer API for the existing project.
7. Open `student.html` from the live site, create/login as a student, enter portions, and press **Build Smart AI Plan**.
8. The AI plan is saved to the same Firestore `plans/{studentUid}` document.
9. Create a parent account in `parent.html`, generate a parent code in Student App, and connect it in Parent App.

You do NOT need a new Firebase project or new Firestore database for V3.
