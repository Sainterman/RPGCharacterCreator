import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest, CharacterData, SessionCheckpoint } from '../types';
import { streamChat, generateSummary, ChatMessage } from '../services/llm';

const router = Router();
router.use(authenticateToken);
const MAX_SESSION_TITLE_LENGTH = 255;
const MAX_SUMMARY_LENGTH = 10000;
const MAX_MESSAGE_LENGTH = 5000;
const CONTEXT_MESSAGE_LIMIT = 20;

// GET /api/gameplay/sessions - List user's sessions
router.get('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT gs.*, c.name as character_name 
       FROM game_sessions gs 
       JOIN characters c ON gs.character_id = c.id 
       WHERE gs.user_id = $1 
       ORDER BY gs.updated_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gameplay/sessions - Create new session
router.post('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { character_id, title } = req.body;

    if (!character_id) {
      res.status(400).json({ error: 'character_id is required' });
      return;
    }
    if (title && (typeof title !== 'string' || title.length > MAX_SESSION_TITLE_LENGTH)) {
      res.status(400).json({ error: `title must be <= ${MAX_SESSION_TITLE_LENGTH} characters` });
      return;
    }

    // Verify character belongs to user
    const charCheck = await pool.query(
      'SELECT id FROM characters WHERE id = $1 AND user_id = $2',
      [character_id, req.user!.id]
    );

    if (charCheck.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO game_sessions (user_id, character_id, title) VALUES ($1, $2, $3) RETURNING *',
      [req.user!.id, character_id, title || 'New Session']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/gameplay/sessions/:id/messages - Get session messages
router.get('/sessions/:id/messages', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM game_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );

    if (sessionCheck.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM session_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gameplay/message - Send message to LLM (streaming)
router.post('/message', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { session_id, message } = req.body;

    if (!session_id || !message) {
      res.status(400).json({ error: 'session_id and message are required' });
      return;
    }
    if (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: `message must be <= ${MAX_MESSAGE_LENGTH} characters` });
      return;
    }

    // Verify session belongs to user and get character data
    const sessionResult = await pool.query(
      `SELECT gs.*, c.data as character_data 
       FROM game_sessions gs 
       JOIN characters c ON gs.character_id = c.id 
       WHERE gs.id = $1 AND gs.user_id = $2`,
      [session_id, req.user!.id]
    );

    if (sessionResult.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const session = sessionResult.rows[0];
    const character = session.character_data as CharacterData;

    // Save user message
    await pool.query(
      'INSERT INTO session_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [session_id, 'user', message]
    );

    // Get earliest messages for context
    const messagesResult = await pool.query(
      'SELECT role, content FROM session_messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT $2',
      [session_id, CONTEXT_MESSAGE_LIMIT]
    );

    // Get checkpoints for session summary context
    const checkpointsResult = await pool.query(
      'SELECT * FROM session_checkpoints WHERE session_id = $1 ORDER BY created_at ASC',
      [session_id]
    );

    const messages: ChatMessage[] = messagesResult.rows.map(r => ({
      role: r.role as 'user' | 'assistant',
      content: r.content,
    }));

    const checkpoints: SessionCheckpoint[] = checkpointsResult.rows;

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    let fullResponse = '';
    let disconnected = false;

    try {
      fullResponse = await streamChat(
        messages,
        character,
        checkpoints,
        (chunk) => {
          if (res.writableEnded || res.destroyed) {
            disconnected = true;
            abortController.abort();
            return;
          }
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        },
        abortController.signal
      );
    } catch (llmError) {
      console.error('LLM error:', llmError);
      if (res.writableEnded || res.destroyed) {
        return;
      }
      res.write(`data: ${JSON.stringify({ error: 'LLM service unavailable' })}\n\n`);
      res.end();
      return;
    }

    if (disconnected || res.writableEnded || res.destroyed) {
      return;
    }

    // Save assistant response
    await pool.query(
      'INSERT INTO session_messages (session_id, role, content) VALUES ($1, $2, $3)',
      [session_id, 'assistant', fullResponse]
    );

    // Update session timestamp
    await pool.query('UPDATE game_sessions SET updated_at = NOW() WHERE id = $1', [session_id]);

    if (!res.writableEnded && !res.destroyed) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Send message error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/gameplay/checkpoint - Save a session checkpoint/summary
router.post('/checkpoint', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      res.status(400).json({ error: 'session_id is required' });
      return;
    }

    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id, summary FROM game_sessions WHERE id = $1 AND user_id = $2',
      [session_id, req.user!.id]
    );

    if (sessionCheck.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Get all messages in the session
    const messagesResult = await pool.query(
      'SELECT role, content FROM session_messages WHERE session_id = $1 AND role != $2 ORDER BY created_at ASC',
      [session_id, 'system']
    );

    const messages: ChatMessage[] = messagesResult.rows;

    if (messages.length === 0) {
      res.status(400).json({ error: 'No messages to summarize' });
      return;
    }

    const existingSummary = sessionCheck.rows[0].summary || '';
    
    let summary: string;
    try {
      summary = await generateSummary(messages, existingSummary);
    } catch (llmError) {
      console.error('Summary generation error:', llmError);
      res.status(503).json({ error: 'LLM service unavailable for summarization' });
      return;
    }
    if (summary.length > MAX_SUMMARY_LENGTH) {
      summary = summary.slice(0, MAX_SUMMARY_LENGTH);
    }

    // Save checkpoint
    const checkpointResult = await pool.query(
      'INSERT INTO session_checkpoints (session_id, summary) VALUES ($1, $2) RETURNING *',
      [session_id, summary]
    );

    // Update session summary
    await pool.query(
      'UPDATE game_sessions SET summary = $1, updated_at = NOW() WHERE id = $2',
      [summary, session_id]
    );

    res.status(201).json(checkpointResult.rows[0]);
  } catch (error) {
    console.error('Checkpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
