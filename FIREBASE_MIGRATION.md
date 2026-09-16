# UnderstandingPulse: Supabase → Firebase migration

## What changed
`components/UnderstandingPulse.vue` used to talk to a Supabase Postgres
table (`understanding_responses`, columns `session_id, poll_id, client_id,
value, created_at`) via `@supabase/supabase-js`: polling `select` every
second plus a `postgres_changes` realtime subscription.

It now talks to Cloud Firestore in the `grl-understandingpulse` Firebase
project via the `firebase` npm package. Data model:

```
understanding_responses (collection)
  └── {sessionId}__{pollId} (doc, synthetic id, no fields of its own)
        └── points (subcollection)
              └── {autoId} (doc: client_id, value, created_at)
```

Keying by `{sessionId}__{pollId}` in the document path (instead of
`where` filters on two fields) avoids needing a Firestore composite
index — the remaining query (`created_at >= since`, ordered by
`created_at`) is a single-field query Firestore supports out of the box.

A Firestore `onSnapshot` listener replaces both the old 1s polling loop
and the separate realtime channel: it pushes new votes immediately and
supplies the initial load in the same call.

The component's props, template and visuals (labels, click-to-vote axis,
fading KDE density) are unchanged — only the data layer moved.

## One-time setup in the Firebase console (project: grl-understandingpulse)
1. **Build → Firestore Database → Create database.** Choose *Native
   mode* (not Datastore mode) and a region close to Bonn, e.g.
   `europe-west3` (Frankfurt). Start in production mode — the rules
   below replace the default deny-all.
2. **Project settings → General → Your apps → Add app → Web (`</>`).**
   Register an app (nickname e.g. "understanding-pulse-web"); no Firebase
   Hosting needed since this deploys to meo-lab.com via GitHub Pages.
   Copy the `firebaseConfig` object it shows you.
3. Paste `apiKey`, `messagingSenderId`, and `appId` from that config into
   `components/UnderstandingPulse.vue` (search for `__FIREBASE_...__`).
   Double check `authDomain` (`grl-understandingpulse.firebaseapp.com`)
   and `storageBucket` match what the console shows — recent projects use
   `*.firebasestorage.app` instead of the older `*.appspot.com`.
4. **Firestore Database → Rules.** Paste the contents of
   `firestore.rules` (committed alongside this file) and click Publish.
   This keeps the same openness the Supabase anon key + RLS setup had —
   anyone can insert a vote and read votes, nobody can edit or delete one
   — but adds server-side validation of the point shape/range that
   Supabase's RLS wasn't obviously doing.

Like the Supabase anon key before it, the Firebase web config is meant to
be public in client-side code — it only identifies the project. Access
control lives entirely in `firestore.rules`, not in the config values.

## After pasting the config
```
npm run dev
```
Open the slide that embeds `<UnderstandingPulse session-id="..." poll-id="..." />`,
click the axis a few times, and confirm dots appear and fade after
`fadeMs` (default 5s). Check the browser console for `UnderstandingPulse
insert failed` / `realtime failed` errors, and check Firestore Database →
Data in the console to see the `understanding_responses` documents
appear.

## Old Supabase project
The Supabase project (`ldefkkjnobeldsuanntt.supabase.co`) is no longer
referenced anywhere in the codebase and can be left paused/deleted.
