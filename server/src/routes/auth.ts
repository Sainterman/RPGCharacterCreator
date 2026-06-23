import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = Router();
const BCRYPT_SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEe.r2T1D7fL4.G2n4M4mxM2Qj8Y3s5j9iG'; // bcrypt hash for "password"

function generateToken(userId: string, username: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, username, email }, secret, { expiresIn } as jwt.SignOptions);
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    if (username.length < 3 || username.length > 50 || !USERNAME_PATTERN.test(username)) {
      res.status(400).json({ error: 'Username must be 3-50 chars and use only letters, numbers, _, ., or -' });
      return;
    }

    if (email.length > 255 || !EMAIL_PATTERN.test(email)) {
      res.status(400).json({ error: 'A valid email address is required' });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
      res.status(400).json({ error: `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.username, user.email);

    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === '23505') {
      res.status(409).json({ error: 'Registration failed. An account with these credentials may already exist.' });
    } else {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    const hashToCompare = user?.password_hash ?? DUMMY_HASH;
    const validPassword = await bcrypt.compare(password, hashToCompare);

    if (!user || !validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.username, user.email);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
