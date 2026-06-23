import { Router, Response } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();
const MAX_CHARACTER_NAME_LENGTH = 100;

function isValidCharacterPayload(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false;
  const value = data as Record<string, unknown>;
  return (typeof value.id === 'undefined' || typeof value.id === 'string')
    && typeof value.name === 'string'
    && typeof value.attributes === 'object'
    && typeof value.abilities === 'object'
    && typeof value.spheres === 'object'
    && typeof value.backgrounds === 'object';
}

// All routes require authentication
router.use(authenticateToken);

// GET /api/characters - List all characters for user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, data, created_at, updated_at FROM characters WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/characters/:id - Get single character
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, data, created_at, updated_at FROM characters WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/characters - Create character
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, data } = req.body;

    if (!name || !data) {
      res.status(400).json({ error: 'Name and data are required' });
      return;
    }
    if (typeof name !== 'string' || name.length < 1 || name.length > MAX_CHARACTER_NAME_LENGTH) {
      res.status(400).json({ error: `Name must be 1-${MAX_CHARACTER_NAME_LENGTH} characters` });
      return;
    }
    if (!isValidCharacterPayload(data)) {
      res.status(400).json({ error: 'Character payload is invalid' });
      return;
    }

    const result = await pool.query(
      'INSERT INTO characters (user_id, name, data) VALUES ($1, $2, $3) RETURNING id, name, data, created_at, updated_at',
      [req.user!.id, name, JSON.stringify(data)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/characters/:id - Update character
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, data } = req.body;
    if (typeof name !== 'undefined' && (typeof name !== 'string' || name.length < 1 || name.length > MAX_CHARACTER_NAME_LENGTH)) {
      res.status(400).json({ error: `Name must be 1-${MAX_CHARACTER_NAME_LENGTH} characters` });
      return;
    }
    if (typeof data !== 'undefined' && data !== null && !isValidCharacterPayload(data)) {
      res.status(400).json({ error: 'Character payload is invalid' });
      return;
    }

    // Treat undefined or an empty object as "no change" to the data field.
    // This prevents accidentally wiping character data when sending {}.
    let dataParam: string | null;
    if (typeof data === 'undefined') {
      dataParam = null;
    } else if (data && typeof data === 'object' && Object.keys(data).length === 0) {
      dataParam = null;
    } else {
      dataParam = JSON.stringify(data);
    }

    const result = await pool.query(
      'UPDATE characters SET name = COALESCE($1, name), data = COALESCE($2, data), updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id, name, data, created_at, updated_at',
      [name, dataParam, req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/characters/:id - Delete character
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM characters WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
