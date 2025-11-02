import { API_BASE_URL, withAppCheckHeaders } from './apiClient.js';

function createApiError(response, payload, fallbackMessage) {
  const error = new Error(
    (payload && (payload.errorDescription || payload.error)) || fallbackMessage,
  );
  error.status = response.status;
  error.code = payload && payload.error;
  error.payload = payload;
  return error;
}

async function handleResponse(response, fallbackMessage) {
  if (response.ok) {
    return response.json();
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (parseError) {
    // Ignore parse failures and fall back to generic messaging.
  }

  throw createApiError(response, payload, fallbackMessage);
}

export async function startAiMatch() {
  const headers = await withAppCheckHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_BASE_URL}/ai-duel/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  return handleResponse(response, 'Failed to start AI duel');
}

export async function submitAiGuess(matchId, roundIndex, guess) {
  const headers = await withAppCheckHeaders({ 'Content-Type': 'application/json' });
  const response = await fetch(`${API_BASE_URL}/ai-duel/guess`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ matchId, roundIndex, guess }),
  });

  return handleResponse(response, 'Failed to submit AI guess');
}