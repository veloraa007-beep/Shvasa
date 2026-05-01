# Shvasa MVP Deployment

## Environment

Copy `.env.example` to `.env.local` for local development and add the same keys in Vercel.

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `GROQ_API_KEY`: private Groq key. Keep server-side only.
- `NEXT_PUBLIC_FIREBASE_*`: Firebase web app config for FCM.
- `FIREBASE_SERVER_KEY`: Firebase Cloud Messaging server key for `/api/notify`.

Rotate any private key that was pasted into chat or committed accidentally.

## Supabase

1. Open Supabase SQL Editor.
2. Run `SUPABASE_SETUP.sql`.
3. Keep email/password auth enabled.
4. Confirm RLS policies are active.

The app creates the Supabase client with:

```ts
createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

## Firebase FCM

1. Create a Firebase web app.
2. Enable Cloud Messaging.
3. Add the public Firebase web config to environment variables.
4. Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
5. Add `FIREBASE_SERVER_KEY` to Vercel for the notify endpoint.

## Local

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel

1. Import the `frontend` directory as the Vercel project root.
2. Add all environment variables.
3. Deploy.

The MVP ships auth, onboarding, exactly three daily tasks, focus mode, Groq AI coaching, Bloom growth, progress stats, and FCM token registration.
