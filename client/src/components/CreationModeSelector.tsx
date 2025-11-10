import React from 'react';
import './CreationModeSelector.css';

interface CreationModeSelectorProps {
  onSelectMode: (mode: 'traditional' | 'freeform') => void;
  onCancel: () => void;
}

const CreationModeSelector: React.FC<CreationModeSelectorProps> = ({ onSelectMode, onCancel }) => {
  return (
    <div className="mode-selector">
      <h1>Create New Character</h1>
      <p className="subtitle">Choose your character creation method</p>
      
      <div className="mode-cards">
        <div className="mode-card" onClick={() => onSelectMode('traditional')}>
          <div className="mode-icon">📜</div>
          <h2>Traditional Creation</h2>
          <p className="mode-description">
            Follow the official Mage: The Ascension character creation rules
          </p>
          <ul className="mode-features">
            <li>Point-buy system for attributes and abilities</li>
            <li>Prioritize attribute and ability categories</li>
            <li>15 freebie points to customize</li>
            <li>Step-by-step guided creation</li>
          </ul>
          <button className="select-mode-button">
            Start Traditional Creation
          </button>
        </div>

        <div className="mode-card" onClick={() => onSelectMode('freeform')}>
          <div className="mode-icon">✨</div>
          <h2>Quick Creation</h2>
          <p className="mode-description">
            Free-form character creation without point restrictions
          </p>
          <ul className="mode-features">
            <li>No point limits or restrictions</li>
            <li>Fill in stats directly</li>
            <li>Perfect for experienced players</li>
            <li>Import existing characters</li>
          </ul>
          <button className="select-mode-button">
            Start Quick Creation
          </button>
        </div>
      </div>

      <button onClick={onCancel} className="cancel-button">
        Back to Character List
      </button>
    </div>
  );
};

export default CreationModeSelector;
