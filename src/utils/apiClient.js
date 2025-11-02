import { ensureAppCheck, getValidAppCheckToken } from './firebaseAppCheck.js';

export const API_BASE_URL = 'https://geo.api.oof2510.space';

export async function withAppCheckHeaders(headers = {}) {
  await ensureAppCheck();
  const token = await getValidAppCheckToken();
  if (token) {
    return {
      ...headers,
      'X-Firebase-AppCheck': token,
    };
  }
  return headers;
}