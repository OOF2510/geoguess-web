import { initializeApp, getApps } from 'firebase/app';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken,
} from 'firebase/app-check';

let appInstance = null;
let appCheckInstance = null;
let cachedToken = null;
let cachedExpiry = 0;
let initializingPromise = null;
let hasWarnedMissingConfig = false;

const TOKEN_EXPIRY_BUFFER = 30 * 1000; // 30 seconds safety buffer

function readFirebaseConfig() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const hasValues = Object.values(config).some(Boolean);

  if (!hasValues) {
    if (!hasWarnedMissingConfig) {
      console.warn('Firebase config missing; App Check disabled.');
      hasWarnedMissingConfig = true;
    }
    return null;
  }

  return config;
}

async function ensureAppInitialized() {
  if (typeof window === 'undefined') return null;
  if (appInstance) return appInstance;

  const config = readFirebaseConfig();
  if (!config) return null;

  if (getApps().length) {
    appInstance = getApps()[0];
  } else {
    appInstance = initializeApp(config);
  }

  return appInstance;
}

export async function ensureAppCheck() {
  if (appCheckInstance || initializingPromise) {
    return initializingPromise || appCheckInstance;
  }

  initializingPromise = (async () => {
    const app = await ensureAppInitialized();
    if (!app) {
      initializingPromise = null;
      return null;
    }

    const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_KEY;
    if (!siteKey) {
      if (!hasWarnedMissingConfig) {
        console.warn('Firebase App Check key missing; continuing without App Check.');
        hasWarnedMissingConfig = true;
      }
      initializingPromise = null;
      return null;
    }

    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });

    initializingPromise = null;
    return appCheckInstance;
  })();

  return initializingPromise;
}

export async function getValidAppCheckToken() {
  const instance = await ensureAppCheck();
  if (!instance) return null;

  const now = Date.now();
  if (!cachedToken || now >= cachedExpiry - TOKEN_EXPIRY_BUFFER) {
    try {
      const result = await getToken(instance, true);
      cachedToken = result.token;
      cachedExpiry = result.expireTimeMillis ?? now + 5 * 60 * 1000;
    } catch (error) {
      console.error('Failed to fetch App Check token:', error);
      return null;
    }
  }

  return cachedToken;
}
