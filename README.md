# RPGCharacterCreator

Character creation and character sheet application for playing Mage: The Ascension 20th Edition — now with a full backend, PostgreSQL database, JWT authentication, and LLM-powered gameplay sessions via Ollama.

## Features

- **Character Creation**: Create detailed Mage characters with all attributes, abilities, spheres, and backgrounds
- **Character Management**: Store and manage multiple characters in a PostgreSQL database
- **Experience Point System**: Track and spend XP to level up your characters
- **World of Darkness Rules**: Built-in XP costs following Mage: The Ascension 20th Edition rules
- **Character Sheet**: Comprehensive character sheet with all stats and information
- **Authentication**: Secure JWT-based user registration and login
- **LLM Gameplay**: Play interactive tabletop sessions with an AI Storyteller powered by Ollama
- **Session Checkpoints**: Save session summaries so the Storyteller remembers your story

## Architecture

```
RPGCharacterCreator/
├── client/          # React + TypeScript + Vite frontend (port 5173)
├── server/          # Node.js + Express + TypeScript backend (port 3001)
└── docker-compose.yml  # PostgreSQL + backend + frontend
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker](https://www.docker.com/) and Docker Compose
- [Ollama](https://ollama.ai/) (optional, for LLM gameplay)

### Quick Start with Docker Compose

The easiest way to run everything together:

```bash
git clone https://github.com/Sainterman/RPGCharacterCreator.git
cd RPGCharacterCreator

# Set your JWT secret (required)
export JWT_SECRET=your_very_long_random_secret_here

# Start all services (PostgreSQL, backend, frontend)
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Manual Setup

#### 1. PostgreSQL

Run a local PostgreSQL instance (or use Docker):

```bash
docker run -d \
  --name mage-postgres \
  -e POSTGRES_USER=mage \
  -e POSTGRES_PASSWORD=mage_password \
  -e POSTGRES_DB=mage_db \
  -p 5432:5432 \
  postgres:16-alpine
```

Apply the database schema:

```bash
psql postgresql://mage:mage_password@localhost:5432/mage_db -f server/migrations/001_initial.sql
```

#### 2. Backend

```bash
cd server
cp .env.example .env
# Edit .env and set JWT_SECRET and DATABASE_URL
npm install
npm run dev
```

Backend runs on http://localhost:3001

#### 3. Frontend

```bash
cd client
cp .env.example .env
# Edit .env if backend is not at http://localhost:3001
npm install
npm run dev
```

Frontend runs on http://localhost:5173

#### 4. Ollama (for LLM gameplay)

Install [Ollama](https://ollama.ai/) and pull a model:

```bash
ollama pull llama3
ollama serve
```

Ollama runs on http://localhost:11434 by default. Configure `OLLAMA_BASE_URL` and `OLLAMA_MODEL` in `server/.env` if needed.

## Environment Variables

### Backend (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://mage:mage_password@localhost:5432/mage_db` | PostgreSQL connection string |
| `JWT_SECRET` | *(required)* | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration |
| `PORT` | `3001` | Backend server port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3` | Ollama model to use for gameplay |

### Frontend (`client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001` | Backend API URL |

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user `{ username, email, password }`
- `POST /api/auth/login` — Login `{ email, password }` → `{ token, user }`

### Characters (require `Authorization: Bearer <token>`)
- `GET /api/characters` — List your characters
- `POST /api/characters` — Create a character `{ name, data }`
- `GET /api/characters/:id` — Get a character
- `PUT /api/characters/:id` — Update a character
- `DELETE /api/characters/:id` — Delete a character

### Gameplay (require authentication)
- `GET /api/gameplay/sessions` — List game sessions
- `POST /api/gameplay/sessions` — Create a session `{ character_id, title }`
- `GET /api/gameplay/sessions/:id/messages` — Get session messages
- `POST /api/gameplay/message` — Send a message (SSE streaming) `{ session_id, message }`
- `POST /api/gameplay/checkpoint` — Save a session summary checkpoint `{ session_id }`

## Usage

### Creating a Character

1. Register/login at http://localhost:5173
2. Click "Create New Character"
3. Choose Traditional (point-buy following official rules) or Quick creation
4. Fill in character details and save

### Managing Experience Points

1. Select a character and click "Manage Experience Points"
2. Add XP and spend it to improve stats at official Mage: The Ascension costs

### Playing a Session

1. Select a character and click "▶ Play Session"
2. Start a new session or continue an existing one
3. Chat with the AI Storyteller — it knows your character sheet!
4. Click "💾 Save Checkpoint" to save a session summary for future context

## XP Costs (Mage: The Ascension 20th Edition)

- **Attributes**: New rating × 4 XP
- **Abilities**: New rating × 2 XP (or 3 XP for a new ability)
- **Spheres**: New rating × 7 XP
- **Arete**: New rating × 8 XP
- **Willpower**: 1 XP per point
- **Backgrounds**: 3 XP to increase, 5 XP for new background

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| LLM | Ollama (local, default model: llama3) |
| DevOps | Docker, Docker Compose |

## Project Structure

```
client/
├── src/
│   ├── components/          # React components (CharacterList, CharacterForm, GameChat, AuthPage, ...)
│   ├── contexts/            # AuthContext for JWT token management
│   ├── services/            # API service layer (api.ts)
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # characterUtils, xpUtils
│   ├── constants/           # Game data constants
│   └── App.tsx              # Main application component
server/
├── src/
│   ├── routes/              # auth.ts, characters.ts, gameplay.ts
│   ├── middleware/          # JWT auth middleware
│   ├── services/            # llm.ts (Ollama integration)
│   ├── db/                  # PostgreSQL pool
│   └── index.ts             # Express app entry point
└── migrations/
    └── 001_initial.sql      # Database schema
```

## License

This project is open source and available under the MIT License.
