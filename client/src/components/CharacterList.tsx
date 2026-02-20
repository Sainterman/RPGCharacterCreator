import React from 'react';
import type { Character } from '../types/character';
import { apiGetCharacters, apiDeleteCharacter } from '../services/api';
import './CharacterList.css';

interface CharacterListProps {
  onSelectCharacter: (character: Character) => void;
  onCreateNew: () => void;
  onLogout: () => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ onSelectCharacter, onCreateNew, onLogout }) => {
  const [characters, setCharacters] = React.useState<Array<{ id: string; name: string; data: Character; updated_at: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const chars = await apiGetCharacters();
      setCharacters(chars);
    } catch {
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        await apiDeleteCharacter(id);
        setCharacters(prev => prev.filter(c => c.id !== id));
      } catch {
        setError('Failed to delete character');
      }
    }
  };

  if (loading) return <div className="character-list"><p>Loading...</p></div>;

  return (
    <div className="character-list">
      <div className="list-header">
        <h1>Mage: The Ascension - Characters</h1>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
      <button onClick={onCreateNew} className="create-button">
        Create New Character
      </button>

      {error && <div className="error-message">{error}</div>}

      {characters.length === 0 ? (
        <div className="empty-state">
          <p>No characters yet. Create your first mage!</p>
        </div>
      ) : (
        <div className="character-grid">
          {characters.map((character) => (
            <div
              key={character.id}
              className="character-card"
              onClick={() => onSelectCharacter(character.data)}
            >
              <div className="character-header">
                <h2>{character.name || 'Unnamed Character'}</h2>
                <button
                  onClick={(e) => handleDelete(character.id, e)}
                  className="delete-button"
                >
                  ×
                </button>
              </div>
              <div className="character-info">
                <p><strong>Tradition:</strong> {character.data?.tradition || 'None'}</p>
                <p><strong>Essence:</strong> {character.data?.essence}</p>
                <p><strong>Arete:</strong> {character.data?.arete}</p>
                <p><strong>XP:</strong> {character.data?.experience} / {character.data?.experienceTotal} total</p>
              </div>
              <div className="character-meta">
                <small>Updated: {new Date(character.updated_at).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterList;
