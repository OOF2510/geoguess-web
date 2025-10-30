import { ensureAppCheck, getValidAppCheckToken } from './firebaseAppCheck.js';

const API_BASE_URL = 'https://geo.api.oof2510.space';

async function withAppCheck(headers = {}) {
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

export async function startGameSession() {
  try {
    const headers = await withAppCheck({ 'Content-Type': 'application/json' });
    const response = await fetch(`${API_BASE_URL}/game/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Game session start failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Falling back to offline mode:', error);
    return null;
  }
}

export async function submitScore(gameSessionId, score, metadata = {}) {
  try {
    const headers = await withAppCheck({ 'Content-Type': 'application/json' });
    const response = await fetch(`${API_BASE_URL}/game/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ gameSessionId, score, metadata }),
    });

    if (!response.ok) {
      throw new Error(`Submit failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

export async function getLeaderboard(limit = 50) {
  const response = await fetch(
    `${API_BASE_URL}/leaderboard/top?${new URLSearchParams({ limit })}`,
  );

  if (!response.ok) {
    throw new Error(`Leaderboard failed: ${response.status}`);
  }

  return response.json();
}
