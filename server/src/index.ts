import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import characterRoutes from './routes/characters';
import gameplayRoutes from './routes/gameplay';

dotenv.config();

// Derive and validate the allowed client origin for CORS.
// IMPORTANT: CLIENT_URL must be a specific origin (e.g. "https://app.example.com"),
// not a wildcard or pattern, because we use credentials: true below.
const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';
if (CLIENT_ORIGIN.includes('*')) {
  throw new Error('Invalid CLIENT_URL: wildcards are not allowed when using credentials: true in CORS configuration.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/characters', defaultLimiter);
app.use('/api/gameplay', defaultLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/gameplay', gameplayRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
