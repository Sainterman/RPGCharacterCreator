import React, { useState, useEffect, useRef } from 'react';
import type { Character } from '../types/character';
import {
  apiCreateSession,
  apiGetMessages,
  apiSendMessage,
  apiSaveCheckpoint,
  apiGetSessions,
} from '../services/api';
import './GameChat.css';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  id: string;
  title: string;
  character_name: string;
  character_id: string;
  summary: string;
  updated_at: string;
}

interface GameChatProps {
  character: Character;
  onBack: () => void;
}

const GameChat: React.FC<GameChatProps> = ({ character, onBack }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [savingCheckpoint, setSavingCheckpoint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Run once on mount to fetch sessions; loadSessions is stable (no external deps change)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const allSessions = await apiGetSessions();
      const charSessions = allSessions.filter((s: Session) =>
        s.character_id === character.id
      );
      setSessions(charSessions);
    } catch {
      setError('Failed to load sessions');
    }
  };

  const startNewSession = async () => {
    try {
      const session = await apiCreateSession(character.id, `Session with ${character.name}`);
      setSessions(prev => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
    } catch {
      setError('Failed to start session');
    }
  };

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const msgs = await apiGetMessages(sessionId);
      setMessages(msgs.map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content,
      })));
    } catch {
      setError('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSessionId || streaming) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setError('');

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      await apiSendMessage(activeSessionId, userMsg.content, (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      });
    } catch {
      setError('Failed to get response. Is the LLM server running?');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const saveCheckpoint = async () => {
    if (!activeSessionId) return;
    setSavingCheckpoint(true);
    try {
      await apiSaveCheckpoint(activeSessionId);
      setError('');
      alert('Checkpoint saved! Session summary updated.');
    } catch {
      setError('Failed to save checkpoint. Is the LLM server running?');
    } finally {
      setSavingCheckpoint(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="game-chat">
      <div className="chat-sidebar">
        <button onClick={onBack} className="back-button">← Back to Character</button>
        <h3>{character.name}</h3>
        <p className="char-info">{character.tradition} · Arete {character.arete}</p>
        <button onClick={startNewSession} className="new-session-button">
          + New Session
        </button>
        <div className="sessions-list">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`session-item ${s.id === activeSessionId ? 'active' : ''}`}
              onClick={() => loadSession(s.id)}
            >
              <div className="session-title">{s.title}</div>
              <div className="session-date">{new Date(s.updated_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {!activeSessionId ? (
          <div className="chat-empty">
            <h2>Ready to play?</h2>
            <p>Select a session or start a new one to begin your story.</p>
            <button onClick={startNewSession} className="start-session-button">
              Start New Session
            </button>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <h3>{sessions.find(s => s.id === activeSessionId)?.title || 'Session'}</h3>
              <button
                onClick={saveCheckpoint}
                disabled={savingCheckpoint || messages.length === 0}
                className="checkpoint-button"
              >
                {savingCheckpoint ? 'Saving...' : '💾 Save Checkpoint'}
              </button>
            </div>

            <div className="messages-container">
              {messages.length === 0 && (
                <div className="messages-empty">
                  <p>The story begins... Say something to start the session.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-role">
                    {msg.role === 'user' ? 'You' : 'Storyteller'}
                  </div>
                  <div className="message-content">
                    {msg.content || (streaming && msg.role === 'assistant' ? '...' : '')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {error && <div className="chat-error">{error}</div>}

            <div className="chat-input-area">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you do? (Enter to send, Shift+Enter for newline)"
                disabled={streaming}
                rows={3}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                className="send-button"
              >
                {streaming ? '...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameChat;
