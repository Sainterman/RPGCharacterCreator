import { useState } from 'react'
import './App.css'
import CharacterList from './components/CharacterList'
import CharacterForm from './components/CharacterForm'
import XPManager from './components/XPManager'
import CreationModeSelector from './components/CreationModeSelector'
import TraditionalCreation from './components/TraditionalCreation'
import type { Character } from './types/character'
import { createEmptyCharacter } from './utils/characterUtils'
import EmeraldApp from './emerald/EmeraldApp'

type View = 'list' | 'modeSelector' | 'traditionalCreation' | 'form' | 'xp';
type Sheet = 'mage' | 'emerald';

const SHEET_KEY = 'selected_sheet';

function App() {
  const [sheet, setSheet] = useState<Sheet>(() =>
    localStorage.getItem(SHEET_KEY) === 'emerald' ? 'emerald' : 'mage'
  );

  const handleSelectSheet = (next: Sheet) => {
    setSheet(next);
    localStorage.setItem(SHEET_KEY, next);
  };

  return (
    <div className="app">
      <nav className="sheet-switcher">
        <button
          className={sheet === 'mage' ? 'is-active' : ''}
          onClick={() => handleSelectSheet('mage')}
        >
          Mage: The Ascension
        </button>
        <button
          className={sheet === 'emerald' ? 'is-active' : ''}
          onClick={() => handleSelectSheet('emerald')}
        >
          Emerald Nightmare
        </button>
      </nav>
      {sheet === 'mage' ? <MageApp /> : <EmeraldApp />}
    </div>
  )
}

function MageApp() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentView('form');
  };

  const handleCreateNew = () => {
    setCurrentView('modeSelector');
  };

  const handleSelectMode = (mode: 'traditional' | 'freeform') => {
    if (mode === 'traditional') {
      setCurrentView('traditionalCreation');
    } else {
      setSelectedCharacter(createEmptyCharacter());
      setCurrentView('form');
    }
  };

  const handleTraditionalComplete = (character: Character) => {
    setSelectedCharacter(character);
    setCurrentView('form');
  };

  const handleSave = () => {
    setCurrentView('list');
    setSelectedCharacter(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedCharacter(null);
  };

  const handleCancelModeSelector = () => {
    setCurrentView('list');
  };

  const handleOpenXPManager = () => {
    if (selectedCharacter) {
      setCurrentView('xp');
    }
  };

  const handleCloseXPManager = () => {
    setCurrentView('form');
  };

  const handleUpdateFromXP = (character: Character) => {
    setSelectedCharacter(character);
  };

  return (
    <div>
      {currentView === 'list' && (
        <CharacterList
          onSelectCharacter={handleSelectCharacter}
          onCreateNew={handleCreateNew}
        />
      )}

      {currentView === 'modeSelector' && (
        <CreationModeSelector
          onSelectMode={handleSelectMode}
          onCancel={handleCancelModeSelector}
        />
      )}

      {currentView === 'traditionalCreation' && (
        <TraditionalCreation
          onComplete={handleTraditionalComplete}
          onCancel={handleCancel}
        />
      )}
      
      {currentView === 'form' && selectedCharacter && (
        <>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleOpenXPManager}
              className="xp-manager-button"
              style={{
                backgroundColor: '#ffc107',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              Manage Experience Points
            </button>
          </div>
          <CharacterForm
            character={selectedCharacter}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </>
      )}
      
      {currentView === 'xp' && selectedCharacter && (
        <XPManager
          character={selectedCharacter}
          onUpdate={handleUpdateFromXP}
          onClose={handleCloseXPManager}
        />
      )}
    </div>
  )
}

export default App
