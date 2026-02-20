const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth
export async function apiRegister(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
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
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

// Characters
export async function apiGetCharacters() {
  const res = await fetch(`${API_BASE}/api/characters`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch characters');
  return res.json();
}

export async function apiGetCharacter(id: string) {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch character');
  return res.json();
}

export async function apiCreateCharacter(name: string, data: unknown) {
  const res = await fetch(`${API_BASE}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, data }),
  });
  if (!res.ok) throw new Error('Failed to create character');
  return res.json();
}

export async function apiUpdateCharacter(id: string, name: string, data: unknown) {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name, data }),
  });
  if (!res.ok) throw new Error('Failed to update character');
  return res.json();
}

export async function apiDeleteCharacter(id: string) {
  const res = await fetch(`${API_BASE}/api/characters/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete character');
}

// Gameplay sessions
export async function apiGetSessions() {
  const res = await fetch(`${API_BASE}/api/gameplay/sessions`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function apiCreateSession(character_id: string, title?: string) {
  const res = await fetch(`${API_BASE}/api/gameplay/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ character_id, title }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function apiGetMessages(session_id: string) {
  const res = await fetch(`${API_BASE}/api/gameplay/sessions/${session_id}/messages`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
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

  if (!res.ok) throw new Error('Failed to send message');
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.content) onChunk(data.content);
      } catch (e) {
        console.debug('Skipping malformed SSE chunk:', line, e);
      }
    }
  }
}

export async function apiSaveCheckpoint(session_id: string) {
  const res = await fetch(`${API_BASE}/api/gameplay/checkpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ session_id }),
  });
  if (!res.ok) throw new Error('Failed to save checkpoint');
  return res.json();
}
