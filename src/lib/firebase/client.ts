import { saveDeviceToken } from '@/lib/supabase/client';
import { ShvasaUser } from '@/lib/shvasa/types';

interface FirebaseCompatApp {
  apps: unknown[];
  initializeApp: (config: Record<string, string | undefined>) => void;
  analytics?: () => unknown;
  messaging: () => {
    getToken: (options: { vapidKey?: string }) => Promise<string>;
  };
}

declare global {
  interface Window {
    firebase?: FirebaseCompatApp;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadFirebaseCompat() {
  await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics-compat.js');
  await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

  if (!window.firebase) {
    throw new Error('Firebase SDK did not load');
  }

  return window.firebase;
}

export async function requestNotificationPermission(user: ShvasaUser) {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission === 'denied') return null;

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission !== 'granted') return null;

   const firebase = await loadFirebaseCompat();
   if (firebase.apps.length === 0) {
     firebase.initializeApp({
       apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
       authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
       projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
       storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
       messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
       appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
       measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
     });
   }

  const token = await firebase.messaging().getToken({
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  if (token) {
    await saveDeviceToken(user.id, token, user.accessToken);
  }

   return token;
 }

export function getAnalytics() {
  if (typeof window === 'undefined' || !window.firebase) return null;
  try {
    return window.firebase.analytics();
  } catch {
    return null;
  }
}
