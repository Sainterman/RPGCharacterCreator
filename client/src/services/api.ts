const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function clearAuthAndSignalExpiry() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.dispatchEvent(new Event('auth:expired'));
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  let message = fallback;
  try {
    const data = await res.json() as { error?: string };
    if (data.error) message = data.error;
  } catch {
    // ignore json parse errors and use fallback message
  }
  if (res.status === 401) {
    clearAuthAndSignalExpiry();
    return 'Your session has expired. Please log in again.';
  }
  return message;
}

// Auth
export async function apiRegister(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Registration failed'));
  }
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Login failed'));
  }
  return res.json();
}

// Characters
export async function apiGetCharacters() {
  const res = await fetch(`${API_BASE}/api/characters`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to fetch characters'));
  return res.json();
}

export async function apiGetCharacter(id: string) {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to fetch character'));
  return res.json();
}

export async function apiCreateCharacter(name: string, data: unknown) {
  const res = await fetch(`${API_BASE}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, data }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to create character'));
  return res.json();
}

export async function apiUpdateCharacter(id: string, name: string, data: unknown) {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, data }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to update character'));
  return res.json();
}

export async function apiDeleteCharacter(id: string) {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to delete character'));
}

// Gameplay sessions
export async function apiGetSessions() {
  const res = await fetch(`${API_BASE}/api/gameplay/sessions`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to fetch sessions'));
  return res.json();
}

export async function apiCreateSession(character_id: string, title?: string) {
  const res = await fetch(`${API_BASE}/api/gameplay/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ character_id, title }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to create session'));
  return res.json();
}

export async function apiGetMessages(session_id: string) {
  const res = await fetch(`${API_BASE}/api/gameplay/sessions/${session_id}/messages`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to fetch messages'));
  return res.json();
}

export async function apiSendMessage(
  session_id: string,
  message: string,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/gameplay/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ session_id, message }),
  });

  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to send message'));
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let receivedData = false;
  let sseErrorMessage: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('data:')) {
        const jsonPart = line.slice(5).trimStart();
        let data: unknown;
        try {
          data = JSON.parse(jsonPart);
        } catch {
          throw new Error('Malformed server response while streaming data');
        }

        receivedData = true;
        if (data && typeof data === 'object') {
          const payload = data as { content?: unknown; error?: unknown };
          if (typeof payload.error === 'string') {
            sseErrorMessage = payload.error;
          }
          if (typeof payload.content === 'string' && payload.content.length > 0) {
            onChunk(payload.content);
          }
        }
      } else if (/^event:\s*error/i.test(line) && !sseErrorMessage) {
        sseErrorMessage = 'The gameplay stream returned an error event';
      }
    }
  }

  if (sseErrorMessage) throw new Error(sseErrorMessage);
  if (!receivedData) throw new Error('No data was received from the gameplay stream');
}

export async function apiSaveCheckpoint(session_id: string) {
  const res = await fetch(`${API_BASE}/api/gameplay/checkpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ session_id }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to save checkpoint'));
  return res.json();
}
