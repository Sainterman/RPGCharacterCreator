# RPGCharacterCreator

Character creation and character sheet application for playing Mage: The Ascension 20th Edition.

## Features

- **Character Creation**: Create detailed Mage characters with all attributes, abilities, spheres, and backgrounds
- **Character Management**: Store and manage multiple characters with localStorage
- **Experience Point System**: Track and spend XP to level up your characters
- **World of Darkness Rules**: Built-in XP costs following Mage: The Ascension 20th Edition rules
- **Character Sheet**: Comprehensive character sheet with all stats and information

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sainterman/RPGCharacterCreator.git
cd RPGCharacterCreator
```

2. Install dependencies:
```bash
cd client
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `client/dist` directory.

## Usage

### Creating a Character

1. Click "Create New Character" on the main screen
2. Fill in the character's basic information (name, tradition, essence, etc.)
3. Set attributes, abilities, spheres, and backgrounds
4. Click "Save" to store the character

### Managing Experience Points

1. Select a character from the list
2. Click "Manage Experience Points" button
3. Click "Add XP" to add experience points to your character
4. Browse through different categories (Attributes, Abilities, Spheres, etc.)
5. Click "Increase" to spend XP and improve stats

### XP Costs (Mage: The Ascension 20th Edition)

- **Attributes**: New rating × 4 XP
- **Abilities**: New rating × 2 XP (or 3 XP for a new ability)
- **Spheres**: New rating × 7 XP
- **Arete**: New rating × 8 XP
- **Willpower**: 1 XP per point
- **Backgrounds**: 3 XP to increase, 5 XP for new background

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **LocalStorage** - Character data persistence

## Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── CharacterList.tsx
│   │   ├── CharacterForm.tsx
│   │   └── XPManager.tsx
│   ├── types/              # TypeScript type definitions
│   │   └── character.ts
│   ├── utils/              # Utility functions
│   │   ├── characterUtils.ts
│   │   └── xpUtils.ts
│   ├── constants/          # Game data constants
│   │   └── gameData.ts
│   └── App.tsx            # Main application component
└── ...
```

## License

This project is open source and available under the MIT License.
