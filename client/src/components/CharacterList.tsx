import React from 'react';
import type { Character } from '../types/character';
import { getCharacters, deleteCharacter } from '../utils/characterUtils';
import './CharacterList.css';

interface CharacterListProps {
  onSelectCharacter: (character: Character) => void;
  onCreateNew: () => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ onSelectCharacter, onCreateNew }) => {
  const [characters, setCharacters] = React.useState<Character[]>([]);

  React.useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = () => {
    const chars = getCharacters();
    setCharacters(chars);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(id);
      loadCharacters();
    }
  };

  return (
    <div className="character-list">
      <h1>Mage: The Ascension - Characters</h1>
      <button onClick={onCreateNew} className="create-button">
        Create New Character
      </button>
      
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
              onClick={() => onSelectCharacter(character)}
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
                <p><strong>Tradition:</strong> {character.tradition || 'None'}</p>
                <p><strong>Essence:</strong> {character.essence}</p>
                <p><strong>Arete:</strong> {character.arete}</p>
                <p><strong>XP:</strong> {character.experience} / {character.experienceTotal} total</p>
              </div>
              <div className="character-meta">
                <small>Updated: {new Date(character.updatedAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterList;
