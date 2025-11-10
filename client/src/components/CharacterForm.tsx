import React from 'react';
import type { Character } from '../types/character';
import { TRADITIONS, ESSENCES, NATURES, DEMEANORS } from '../constants/gameData';
import { saveCharacter } from '../utils/characterUtils';
import './CharacterForm.css';

interface CharacterFormProps {
  character: Character;
  onSave: () => void;
  onCancel: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ character, onSave, onCancel }) => {
  const [char, setChar] = React.useState<Character>(character);

  const updateField = (field: keyof Character, value: any) => {
    setChar({ ...char, [field]: value });
  };

  const updateAttribute = (attr: keyof Character['attributes'], value: number) => {
    setChar({
      ...char,
      attributes: { ...char.attributes, [attr]: value },
    });
  };

  const updateAbility = (ability: keyof Character['abilities'], value: number) => {
    setChar({
      ...char,
      abilities: { ...char.abilities, [ability]: value },
    });
  };

  const updateSphere = (sphere: keyof Character['spheres'], value: number) => {
    setChar({
      ...char,
      spheres: { ...char.spheres, [sphere]: value },
    });
  };

  const updateBackground = (bg: keyof Character['backgrounds'], value: number) => {
    setChar({
      ...char,
      backgrounds: { ...char.backgrounds, [bg]: value },
    });
  };

  const handleSave = () => {
    saveCharacter(char);
    onSave();
  };

  return (
    <div className="character-form">
      <div className="form-header">
        <h1>Character Sheet</h1>
        <div className="form-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={onCancel} className="cancel-button">Back</button>
        </div>
      </div>

      <div className="form-section">
        <h2>Basic Information</h2>
        <div className="form-grid">
          <div className="form-field">
            <label>Name</label>
            <input
              type="text"
              value={char.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Player</label>
            <input
              type="text"
              value={char.player}
              onChange={(e) => updateField('player', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Chronicle</label>
            <input
              type="text"
              value={char.chronicle}
              onChange={(e) => updateField('chronicle', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Concept</label>
            <input
              type="text"
              value={char.concept}
              onChange={(e) => updateField('concept', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Tradition</label>
            <select
              value={char.tradition}
              onChange={(e) => updateField('tradition', e.target.value)}
            >
              <option value="">Select...</option>
              {TRADITIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Essence</label>
            <select
              value={char.essence}
              onChange={(e) => updateField('essence', e.target.value)}
            >
              {ESSENCES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Nature</label>
            <select
              value={char.nature}
              onChange={(e) => updateField('nature', e.target.value)}
            >
              <option value="">Select...</option>
              {NATURES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Demeanor</label>
            <select
              value={char.demeanor}
              onChange={(e) => updateField('demeanor', e.target.value)}
            >
              <option value="">Select...</option>
              {DEMEANORS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Cabal</label>
            <input
              type="text"
              value={char.cabal}
              onChange={(e) => updateField('cabal', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Attributes</h2>
        <div className="attributes-grid">
          <div className="attribute-category">
            <h3>Physical</h3>
            {(['strength', 'dexterity', 'stamina'] as const).map((attr) => (
              <div key={attr} className="stat-field">
                <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={char.attributes[attr]}
                  onChange={(e) => updateAttribute(attr, parseInt(e.target.value) || 1)}
                />
              </div>
            ))}
          </div>
          <div className="attribute-category">
            <h3>Social</h3>
            {(['charisma', 'manipulation', 'appearance'] as const).map((attr) => (
              <div key={attr} className="stat-field">
                <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={char.attributes[attr]}
                  onChange={(e) => updateAttribute(attr, parseInt(e.target.value) || 1)}
                />
              </div>
            ))}
          </div>
          <div className="attribute-category">
            <h3>Mental</h3>
            {(['perception', 'intelligence', 'wits'] as const).map((attr) => (
              <div key={attr} className="stat-field">
                <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={char.attributes[attr]}
                  onChange={(e) => updateAttribute(attr, parseInt(e.target.value) || 1)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Abilities</h2>
        <div className="abilities-grid">
          <div className="ability-category">
            <h3>Talents</h3>
            {(['alertness', 'athletics', 'awareness', 'brawl', 'empathy', 'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge'] as const).map((ability) => (
              <div key={ability} className="stat-field">
                <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={char.abilities[ability]}
                  onChange={(e) => updateAbility(ability, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
          <div className="ability-category">
            <h3>Skills</h3>
            {(['crafts', 'drive', 'etiquette', 'firearms', 'meditation', 'melee', 'research', 'stealth', 'survival', 'technology'] as const).map((ability) => (
              <div key={ability} className="stat-field">
                <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={char.abilities[ability]}
                  onChange={(e) => updateAbility(ability, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
          <div className="ability-category">
            <h3>Knowledges</h3>
            {(['academics', 'computer', 'cosmology', 'enigmas', 'investigation', 'law', 'medicine', 'occult', 'politics', 'science'] as const).map((ability) => (
              <div key={ability} className="stat-field">
                <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={char.abilities[ability]}
                  onChange={(e) => updateAbility(ability, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Spheres</h2>
        <div className="spheres-grid">
          {(['correspondence', 'entropy', 'forces', 'life', 'matter', 'mind', 'prime', 'spirit', 'time'] as const).map((sphere) => (
            <div key={sphere} className="stat-field">
              <label>{sphere.charAt(0).toUpperCase() + sphere.slice(1)}</label>
              <input
                type="number"
                min="0"
                max="5"
                value={char.spheres[sphere]}
                onChange={(e) => updateSphere(sphere, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>Backgrounds</h2>
        <div className="backgrounds-grid">
          {(['allies', 'arcane', 'avatar', 'contacts', 'destiny', 'dream', 'influence', 'mentor', 'node', 'resources', 'sanctum', 'wonder'] as const).map((bg) => (
            <div key={bg} className="stat-field">
              <label>{bg.charAt(0).toUpperCase() + bg.slice(1)}</label>
              <input
                type="number"
                min="0"
                max="5"
                value={char.backgrounds[bg]}
                onChange={(e) => updateBackground(bg, parseInt(e.target.value) || 0)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h2>Advantages</h2>
        <div className="advantages-grid">
          <div className="stat-field">
            <label>Arete</label>
            <input
              type="number"
              min="1"
              max="10"
              value={char.arete}
              onChange={(e) => updateField('arete', parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="stat-field">
            <label>Willpower (Max)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={char.willpower}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setChar({ ...char, willpower: val, willpowerCurrent: Math.min(char.willpowerCurrent, val) });
              }}
            />
          </div>
          <div className="stat-field">
            <label>Willpower (Current)</label>
            <input
              type="number"
              min="0"
              max={char.willpower}
              value={char.willpowerCurrent}
              onChange={(e) => updateField('willpowerCurrent', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="stat-field">
            <label>Quintessence (Max)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={char.quintessenceMax}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setChar({ ...char, quintessenceMax: val, quintessence: Math.min(char.quintessence, val) });
              }}
            />
          </div>
          <div className="stat-field">
            <label>Quintessence (Current)</label>
            <input
              type="number"
              min="0"
              max={char.quintessenceMax}
              value={char.quintessence}
              onChange={(e) => updateField('quintessence', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="stat-field">
            <label>Paradox</label>
            <input
              type="number"
              min="0"
              max="20"
              value={char.paradox}
              onChange={(e) => updateField('paradox', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Experience</h2>
        <div className="experience-grid">
          <div className="stat-field">
            <label>Current XP</label>
            <input
              type="number"
              min="0"
              value={char.experience}
              onChange={(e) => updateField('experience', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="stat-field">
            <label>Total XP Earned</label>
            <input
              type="number"
              min="0"
              value={char.experienceTotal}
              onChange={(e) => updateField('experienceTotal', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>Notes</h2>
        <textarea
          rows={6}
          value={char.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Add any additional notes, merits, flaws, or equipment here..."
        />
      </div>
    </div>
  );
};

export default CharacterForm;
