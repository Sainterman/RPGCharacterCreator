import React from 'react';
import type { Character } from '../types/character';
import {
  calculateAttributeXPCost,
  calculateAbilityXPCost,
  calculateSphereXPCost,
  calculateAreteXPCost,
  calculateWillpowerXPCost,
  calculateBackgroundXPCost,
  canAffordXP,
  spendXP,
  addXP,
} from '../utils/xpUtils';
import { saveCharacter } from '../utils/characterUtils';
import './XPManager.css';

interface XPManagerProps {
  character: Character;
  onUpdate: (character: Character) => void;
  onClose: () => void;
}

const XPManager: React.FC<XPManagerProps> = ({ character, onUpdate, onClose }) => {
  const [char, setChar] = React.useState<Character>(character);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('attributes');

  const handleAddXP = () => {
    const amount = parseInt(prompt('How much XP to add?') || '0');
    if (amount > 0) {
      const updated = addXP(char, amount);
      setChar(updated);
      saveCharacter(updated);
      onUpdate(updated);
    }
  };

  const handleSpendXP = (type: string, key: string, currentValue: number) => {
    let cost = 0;
    let description = '';

    switch (type) {
      case 'attribute': {
        const calc = calculateAttributeXPCost(currentValue);
        cost = calc.cost;
        description = calc.description;
        break;
      }
      case 'ability': {
        const calc = calculateAbilityXPCost(currentValue);
        cost = calc.cost;
        description = calc.description;
        break;
      }
      case 'sphere': {
        const calc = calculateSphereXPCost(currentValue);
        cost = calc.cost;
        description = calc.description;
        break;
      }
      case 'background': {
        const calc = calculateBackgroundXPCost(currentValue);
        cost = calc.cost;
        description = calc.description;
        break;
      }
      case 'arete': {
        const calc = calculateAreteXPCost(currentValue);
        cost = calc.cost;
        description = calc.description;
        break;
      }
      case 'willpower': {
        const calc = calculateWillpowerXPCost();
        cost = calc.cost;
        description = calc.description;
        break;
      }
    }

    if (!canAffordXP(char, cost)) {
      alert(`Not enough XP! You need ${cost} XP but only have ${char.experience}.`);
      return;
    }

    if (window.confirm(`Spend ${cost} XP to ${description}?`)) {
      let updated = spendXP(char, cost);

      // Update the actual stat
      switch (type) {
        case 'attribute':
          updated = {
            ...updated,
            attributes: { ...updated.attributes, [key]: currentValue + 1 },
          };
          break;
        case 'ability':
          updated = {
            ...updated,
            abilities: { ...updated.abilities, [key]: currentValue + 1 },
          };
          break;
        case 'sphere':
          updated = {
            ...updated,
            spheres: { ...updated.spheres, [key]: currentValue + 1 },
          };
          break;
        case 'background':
          updated = {
            ...updated,
            backgrounds: { ...updated.backgrounds, [key]: currentValue + 1 },
          };
          break;
        case 'arete':
          updated = { ...updated, arete: currentValue + 1 };
          break;
        case 'willpower':
          updated = {
            ...updated,
            willpower: currentValue + 1,
            willpowerCurrent: currentValue + 1,
          };
          break;
      }

      setChar(updated);
      saveCharacter(updated);
      onUpdate(updated);
    }
  };

  return (
    <div className="xp-manager">
      <div className="xp-header">
        <h2>Experience Point Manager</h2>
        <button onClick={onClose} className="close-button">Close</button>
      </div>

      <div className="xp-display">
        <div className="xp-stat">
          <span className="xp-label">Available XP:</span>
          <span className="xp-value">{char.experience}</span>
        </div>
        <div className="xp-stat">
          <span className="xp-label">Total XP Earned:</span>
          <span className="xp-value">{char.experienceTotal}</span>
        </div>
        <button onClick={handleAddXP} className="add-xp-button">
          Add XP
        </button>
      </div>

      <div className="xp-categories">
        <button
          className={selectedCategory === 'attributes' ? 'active' : ''}
          onClick={() => setSelectedCategory('attributes')}
        >
          Attributes
        </button>
        <button
          className={selectedCategory === 'abilities' ? 'active' : ''}
          onClick={() => setSelectedCategory('abilities')}
        >
          Abilities
        </button>
        <button
          className={selectedCategory === 'spheres' ? 'active' : ''}
          onClick={() => setSelectedCategory('spheres')}
        >
          Spheres
        </button>
        <button
          className={selectedCategory === 'backgrounds' ? 'active' : ''}
          onClick={() => setSelectedCategory('backgrounds')}
        >
          Backgrounds
        </button>
        <button
          className={selectedCategory === 'advantages' ? 'active' : ''}
          onClick={() => setSelectedCategory('advantages')}
        >
          Advantages
        </button>
      </div>

      <div className="xp-content">
        {selectedCategory === 'attributes' && (
          <div className="xp-list">
            <h3>Attributes</h3>
            {Object.entries(char.attributes).map(([key, value]) => {
              const cost = calculateAttributeXPCost(value).cost;
              const canAfford = canAffordXP(char, cost);
              const atMax = value >= 5;
              return (
                <div key={key} className="xp-item">
                  <span className="stat-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="stat-value">{value}</span>
                  <span className="stat-cost">Cost: {cost} XP</span>
                  <button
                    onClick={() => handleSpendXP('attribute', key, value)}
                    disabled={!canAfford || atMax}
                    className="spend-button"
                  >
                    {atMax ? 'Max' : canAfford ? 'Increase' : 'Can\'t Afford'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedCategory === 'abilities' && (
          <div className="xp-list">
            <h3>Abilities</h3>
            {Object.entries(char.abilities).map(([key, value]) => {
              const cost = calculateAbilityXPCost(value).cost;
              const canAfford = canAffordXP(char, cost);
              const atMax = value >= 5;
              return (
                <div key={key} className="xp-item">
                  <span className="stat-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="stat-value">{value}</span>
                  <span className="stat-cost">Cost: {cost} XP</span>
                  <button
                    onClick={() => handleSpendXP('ability', key, value)}
                    disabled={!canAfford || atMax}
                    className="spend-button"
                  >
                    {atMax ? 'Max' : canAfford ? 'Increase' : 'Can\'t Afford'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedCategory === 'spheres' && (
          <div className="xp-list">
            <h3>Spheres</h3>
            {Object.entries(char.spheres).map(([key, value]) => {
              const cost = calculateSphereXPCost(value).cost;
              const canAfford = canAffordXP(char, cost);
              const atMax = value >= 5;
              return (
                <div key={key} className="xp-item">
                  <span className="stat-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="stat-value">{value}</span>
                  <span className="stat-cost">Cost: {cost} XP</span>
                  <button
                    onClick={() => handleSpendXP('sphere', key, value)}
                    disabled={!canAfford || atMax}
                    className="spend-button"
                  >
                    {atMax ? 'Max' : canAfford ? 'Increase' : 'Can\'t Afford'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedCategory === 'backgrounds' && (
          <div className="xp-list">
            <h3>Backgrounds</h3>
            {Object.entries(char.backgrounds).map(([key, value]) => {
              const cost = calculateBackgroundXPCost(value).cost;
              const canAfford = canAffordXP(char, cost);
              const atMax = value >= 5;
              return (
                <div key={key} className="xp-item">
                  <span className="stat-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="stat-value">{value}</span>
                  <span className="stat-cost">Cost: {cost} XP</span>
                  <button
                    onClick={() => handleSpendXP('background', key, value)}
                    disabled={!canAfford || atMax}
                    className="spend-button"
                  >
                    {atMax ? 'Max' : canAfford ? 'Increase' : 'Can\'t Afford'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {selectedCategory === 'advantages' && (
          <div className="xp-list">
            <h3>Advantages</h3>
            <div className="xp-item">
              <span className="stat-name">Arete</span>
              <span className="stat-value">{char.arete}</span>
              <span className="stat-cost">Cost: {calculateAreteXPCost(char.arete).cost} XP</span>
              <button
                onClick={() => handleSpendXP('arete', 'arete', char.arete)}
                disabled={!canAffordXP(char, calculateAreteXPCost(char.arete).cost) || char.arete >= 10}
                className="spend-button"
              >
                {char.arete >= 10 ? 'Max' : canAffordXP(char, calculateAreteXPCost(char.arete).cost) ? 'Increase' : 'Can\'t Afford'}
              </button>
            </div>
            <div className="xp-item">
              <span className="stat-name">Willpower (Permanent)</span>
              <span className="stat-value">{char.willpower}</span>
              <span className="stat-cost">Cost: {calculateWillpowerXPCost().cost} XP</span>
              <button
                onClick={() => handleSpendXP('willpower', 'willpower', char.willpower)}
                disabled={!canAffordXP(char, calculateWillpowerXPCost().cost) || char.willpower >= 10}
                className="spend-button"
              >
                {char.willpower >= 10 ? 'Max' : canAffordXP(char, calculateWillpowerXPCost().cost) ? 'Increase' : 'Can\'t Afford'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XPManager;
