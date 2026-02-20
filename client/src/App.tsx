import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import CharacterList from './components/CharacterList'
import CharacterForm from './components/CharacterForm'
import XPManager from './components/XPManager'
import CreationModeSelector from './components/CreationModeSelector'
import TraditionalCreation from './components/TraditionalCreation'
import GameChat from './components/GameChat'
import type { Character } from './types/character'
import { createEmptyCharacter } from './utils/characterUtils'

type View = 'list' | 'modeSelector' | 'traditionalCreation' | 'form' | 'xp' | 'chat';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) return <AuthPage />;

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

  const handleOpenChat = () => {
    if (selectedCharacter) {
      setCurrentView('chat');
    }
  };

  const handleBackFromChat = () => {
    setCurrentView('form');
  };

  return (
    <div className="app">
      {currentView === 'list' && (
        <CharacterList
          onSelectCharacter={handleSelectCharacter}
          onCreateNew={handleCreateNew}
          onLogout={logout}
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
          <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
            <button
              onClick={handleOpenChat}
              style={{
                backgroundColor: '#6c3483',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                borderRadius: '4px',
                marginBottom: '10px',
              }}
            >
              ▶ Play Session
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

      {currentView === 'chat' && selectedCharacter && (
        <GameChat
          character={selectedCharacter}
          onBack={handleBackFromChat}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
