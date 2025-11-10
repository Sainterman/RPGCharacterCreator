import React from 'react';
import type { Character, Essence, Affinity } from '../types/character';
import { TRADITIONS, ESSENCES, NATURES, DEMEANORS, CREATION_POINTS, FREEBIE_COSTS, ATTRIBUTE_CATEGORIES, ABILITY_CATEGORIES, SPHERE_NAMES, BACKGROUND_NAMES } from '../constants/gameData';
import { createEmptyCharacter, saveCharacter } from '../utils/characterUtils';
import './TraditionalCreation.css';

type Step = 'concept' | 'attributes' | 'abilities' | 'advantages' | 'freebies' | 'review';
type Priority = 'primary' | 'secondary' | 'tertiary';

interface TraditionalCreationProps {
  onComplete: (character: Character) => void;
  onCancel: () => void;
}

interface PointAllocation {
  attributePriorities: {
    physical: Priority | null;
    social: Priority | null;
    mental: Priority | null;
  };
  abilityPriorities: {
    talents: Priority | null;
    skills: Priority | null;
    knowledges: Priority | null;
  };
}

const TraditionalCreation: React.FC<TraditionalCreationProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = React.useState<Step>('concept');
  const [character, setCharacter] = React.useState<Character>(createEmptyCharacter());
  const [allocation, setAllocation] = React.useState<PointAllocation>({
    attributePriorities: { physical: null, social: null, mental: null },
    abilityPriorities: { talents: null, skills: null, knowledges: null },
  });
  const [freebiePoints, setFreebiePoints] = React.useState(CREATION_POINTS.freebiePoints);

  // Calculate points spent in each category
  const getAttributePointsSpent = (category: 'physical' | 'social' | 'mental'): number => {
    const attrs = ATTRIBUTE_CATEGORIES[category];
    return attrs.reduce((sum, attr) => sum + character.attributes[attr] - 1, 0); // -1 because base is 1
  };

  const getAbilityPointsSpent = (category: 'talents' | 'skills' | 'knowledges'): number => {
    const abilities = ABILITY_CATEGORIES[category];
    return abilities.reduce((sum, ability) => sum + character.abilities[ability], 0);
  };

  const getAttributePointsAvailable = (category: 'physical' | 'social' | 'mental'): number => {
    const priority = allocation.attributePriorities[category];
    if (!priority) return 0;
    return CREATION_POINTS.attributes[priority];
  };

  const getAbilityPointsAvailable = (category: 'talents' | 'skills' | 'knowledges'): number => {
    const priority = allocation.abilityPriorities[category];
    if (!priority) return 0;
    return CREATION_POINTS.abilities[priority];
  };

  const updateCharacterField = <K extends keyof Character>(field: K, value: Character[K]) => {
    setCharacter({ ...character, [field]: value });
  };

  const updateAttribute = (attr: keyof Character['attributes'], value: number) => {
    setCharacter({
      ...character,
      attributes: { ...character.attributes, [attr]: value },
    });
  };

  const updateAbility = (ability: keyof Character['abilities'], value: number) => {
    setCharacter({
      ...character,
      abilities: { ...character.abilities, [ability]: value },
    });
  };

  const updateSphere = (sphere: keyof Character['spheres'], value: number) => {
    setCharacter({
      ...character,
      spheres: { ...character.spheres, [sphere]: value },
    });
  };

  const updateBackground = (bg: keyof Character['backgrounds'], value: number) => {
    setCharacter({
      ...character,
      backgrounds: { ...character.backgrounds, [bg]: value },
    });
  };

  const setAttributePriority = (category: 'physical' | 'social' | 'mental', priority: Priority) => {
    const newPriorities = { ...allocation.attributePriorities };
    
    // Clear any existing assignment of this priority
    (Object.keys(newPriorities) as Array<'physical' | 'social' | 'mental'>).forEach(cat => {
      if (newPriorities[cat] === priority) {
        newPriorities[cat] = null;
      }
    });
    
    newPriorities[category] = priority;
    setAllocation({ ...allocation, attributePriorities: newPriorities });
  };

  const setAbilityPriority = (category: 'talents' | 'skills' | 'knowledges', priority: Priority) => {
    const newPriorities = { ...allocation.abilityPriorities };
    
    // Clear any existing assignment of this priority
    (Object.keys(newPriorities) as Array<'talents' | 'skills' | 'knowledges'>).forEach(cat => {
      if (newPriorities[cat] === priority) {
        newPriorities[cat] = null;
      }
    });
    
    newPriorities[category] = priority;
    setAllocation({ ...allocation, abilityPriorities: newPriorities });
  };

  const spendFreebiePoint = (type: keyof typeof FREEBIE_COSTS, currentValue: number, updateFn: (value: number) => void) => {
    const cost = FREEBIE_COSTS[type];
    if (freebiePoints >= cost) {
      setFreebiePoints(freebiePoints - cost);
      updateFn(currentValue + 1);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'concept':
        return character.name.length > 0 && character.tradition.length > 0;
      case 'attributes':
        return Object.values(allocation.attributePriorities).every(p => p !== null);
      case 'abilities':
        return Object.values(allocation.abilityPriorities).every(p => p !== null);
      case 'advantages':
        return true;
      case 'freebies':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    const steps: Step[] = ['concept', 'attributes', 'abilities', 'advantages', 'freebies', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: Step[] = ['concept', 'attributes', 'abilities', 'advantages', 'freebies', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = () => {
    saveCharacter(character);
    onComplete(character);
  };

  const getTotalSpherePoints = (): number => {
    return Object.values(character.spheres).reduce((sum, val) => sum + val, 0);
  };

  const getTotalBackgroundPoints = (): number => {
    return Object.values(character.backgrounds).reduce((sum, val) => sum + val, 0);
  };

  return (
    <div className="traditional-creation">
      <div className="creation-header">
        <h1>Traditional Character Creation</h1>
        <div className="step-indicator">
          <span className={step === 'concept' ? 'active' : ''}>1. Concept</span>
          <span className={step === 'attributes' ? 'active' : ''}>2. Attributes</span>
          <span className={step === 'abilities' ? 'active' : ''}>3. Abilities</span>
          <span className={step === 'advantages' ? 'active' : ''}>4. Advantages</span>
          <span className={step === 'freebies' ? 'active' : ''}>5. Freebies</span>
          <span className={step === 'review' ? 'active' : ''}>6. Review</span>
        </div>
      </div>

      <div className="creation-content">
        {/* Step 1: Concept */}
        {step === 'concept' && (
          <div className="step-section">
            <h2>Step 1: Character Concept</h2>
            <p className="step-description">Define the basic concept of your character</p>
            
            <div className="form-grid">
              <div className="form-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateCharacterField('name', e.target.value)}
                  placeholder="Enter character name"
                />
              </div>
              
              <div className="form-field">
                <label>Player</label>
                <input
                  type="text"
                  value={character.player}
                  onChange={(e) => updateCharacterField('player', e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="form-field">
                <label>Chronicle</label>
                <input
                  type="text"
                  value={character.chronicle}
                  onChange={(e) => updateCharacterField('chronicle', e.target.value)}
                  placeholder="Chronicle name"
                />
              </div>

              <div className="form-field">
                <label>Concept</label>
                <input
                  type="text"
                  value={character.concept}
                  onChange={(e) => updateCharacterField('concept', e.target.value)}
                  placeholder="e.g., Street Witch, Hermetic Scholar"
                />
              </div>

              <div className="form-field">
                <label>Tradition *</label>
                <select
                  value={character.tradition}
                  onChange={(e) => updateCharacterField('tradition', e.target.value)}
                >
                  <option value="">Select Tradition...</option>
                  {TRADITIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Essence</label>
                <select
                  value={character.essence}
                  onChange={(e) => updateCharacterField('essence', e.target.value as Essence)}
                >
                  {ESSENCES.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Nature</label>
                <select
                  value={character.nature}
                  onChange={(e) => updateCharacterField('nature', e.target.value)}
                >
                  <option value="">Select Nature...</option>
                  {NATURES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Demeanor</label>
                <select
                  value={character.demeanor}
                  onChange={(e) => updateCharacterField('demeanor', e.target.value)}
                >
                  <option value="">Select Demeanor...</option>
                  {DEMEANORS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Cabal</label>
                <input
                  type="text"
                  value={character.cabal}
                  onChange={(e) => updateCharacterField('cabal', e.target.value)}
                  placeholder="Cabal name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Attributes */}
        {step === 'attributes' && (
          <div className="step-section">
            <h2>Step 2: Attributes</h2>
            <p className="step-description">
              Prioritize your attribute categories, then distribute points (Primary: 7, Secondary: 5, Tertiary: 3)
            </p>

            <div className="priority-selector">
              <div className="category-priority">
                <h3>Physical Attributes</h3>
                <div className="priority-buttons">
                  <button
                    className={allocation.attributePriorities.physical === 'primary' ? 'active' : ''}
                    onClick={() => setAttributePriority('physical', 'primary')}
                  >
                    Primary (7)
                  </button>
                  <button
                    className={allocation.attributePriorities.physical === 'secondary' ? 'active' : ''}
                    onClick={() => setAttributePriority('physical', 'secondary')}
                  >
                    Secondary (5)
                  </button>
                  <button
                    className={allocation.attributePriorities.physical === 'tertiary' ? 'active' : ''}
                    onClick={() => setAttributePriority('physical', 'tertiary')}
                  >
                    Tertiary (3)
                  </button>
                </div>
              </div>

              <div className="category-priority">
                <h3>Social Attributes</h3>
                <div className="priority-buttons">
                  <button
                    className={allocation.attributePriorities.social === 'primary' ? 'active' : ''}
                    onClick={() => setAttributePriority('social', 'primary')}
                  >
                    Primary (7)
                  </button>
                  <button
                    className={allocation.attributePriorities.social === 'secondary' ? 'active' : ''}
                    onClick={() => setAttributePriority('social', 'secondary')}
                  >
                    Secondary (5)
                  </button>
                  <button
                    className={allocation.attributePriorities.social === 'tertiary' ? 'active' : ''}
                    onClick={() => setAttributePriority('social', 'tertiary')}
                  >
                    Tertiary (3)
                  </button>
                </div>
              </div>

              <div className="category-priority">
                <h3>Mental Attributes</h3>
                <div className="priority-buttons">
                  <button
                    className={allocation.attributePriorities.mental === 'primary' ? 'active' : ''}
                    onClick={() => setAttributePriority('mental', 'primary')}
                  >
                    Primary (7)
                  </button>
                  <button
                    className={allocation.attributePriorities.mental === 'secondary' ? 'active' : ''}
                    onClick={() => setAttributePriority('mental', 'secondary')}
                  >
                    Secondary (5)
                  </button>
                  <button
                    className={allocation.attributePriorities.mental === 'tertiary' ? 'active' : ''}
                    onClick={() => setAttributePriority('mental', 'tertiary')}
                  >
                    Tertiary (3)
                  </button>
                </div>
              </div>
            </div>

            {Object.values(allocation.attributePriorities).every(p => p !== null) && (
              <div className="attributes-allocation">
                <div className="attribute-category">
                  <h3>Physical ({getAttributePointsSpent('physical')} / {getAttributePointsAvailable('physical')} points)</h3>
                  {(ATTRIBUTE_CATEGORIES.physical).map((attr) => (
                    <div key={attr} className="stat-input">
                      <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={character.attributes[attr]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          const pointsSpent = getAttributePointsSpent('physical') - (character.attributes[attr] - 1);
                          if (pointsSpent + (newValue - 1) <= getAttributePointsAvailable('physical')) {
                            updateAttribute(attr, newValue);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="attribute-category">
                  <h3>Social ({getAttributePointsSpent('social')} / {getAttributePointsAvailable('social')} points)</h3>
                  {(ATTRIBUTE_CATEGORIES.social).map((attr) => (
                    <div key={attr} className="stat-input">
                      <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={character.attributes[attr]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          const pointsSpent = getAttributePointsSpent('social') - (character.attributes[attr] - 1);
                          if (pointsSpent + (newValue - 1) <= getAttributePointsAvailable('social')) {
                            updateAttribute(attr, newValue);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="attribute-category">
                  <h3>Mental ({getAttributePointsSpent('mental')} / {getAttributePointsAvailable('mental')} points)</h3>
                  {(ATTRIBUTE_CATEGORIES.mental).map((attr) => (
                    <div key={attr} className="stat-input">
                      <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={character.attributes[attr]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 1;
                          const pointsSpent = getAttributePointsSpent('mental') - (character.attributes[attr] - 1);
                          if (pointsSpent + (newValue - 1) <= getAttributePointsAvailable('mental')) {
                            updateAttribute(attr, newValue);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Abilities */}
        {step === 'abilities' && (
          <div className="step-section">
            <h2>Step 3: Abilities</h2>
            <p className="step-description">
              Prioritize your ability categories, then distribute points (Primary: 13, Secondary: 9, Tertiary: 5)
            </p>

            <div className="priority-selector">
              <div className="category-priority">
                <h3>Talents</h3>
                <div className="priority-buttons">
                  <button
                    className={allocation.abilityPriorities.talents === 'primary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('talents', 'primary')}
                  >
                    Primary (13)
                  </button>
                  <button
                    className={allocation.abilityPriorities.talents === 'secondary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('talents', 'secondary')}
                  >
                    Secondary (9)
                  </button>
                  <button
                    className={allocation.abilityPriorities.talents === 'tertiary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('talents', 'tertiary')}
                  >
                    Tertiary (5)
                  </button>
                </div>
              </div>

              <div className="category-priority">
                <h3>Skills</h3>
                <div className="priority-buttons">
                  <button
                    className={allocation.abilityPriorities.skills === 'primary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('skills', 'primary')}
                  >
                    Primary (13)
                  </button>
                  <button
                    className={allocation.abilityPriorities.skills === 'secondary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('skills', 'secondary')}
                  >
                    Secondary (9)
                  </button>
                  <button
                    className={allocation.abilityPriorities.skills === 'tertiary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('skills', 'tertiary')}
                  >
                    Tertiary (5)
                  </button>
                </div>
              </div>

              <div className="category-priority">
                <h3>Knowledges</h3>
                <div className="priority-buttons">
                  <button
                    className={allocation.abilityPriorities.knowledges === 'primary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('knowledges', 'primary')}
                  >
                    Primary (13)
                  </button>
                  <button
                    className={allocation.abilityPriorities.knowledges === 'secondary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('knowledges', 'secondary')}
                  >
                    Secondary (9)
                  </button>
                  <button
                    className={allocation.abilityPriorities.knowledges === 'tertiary' ? 'active' : ''}
                    onClick={() => setAbilityPriority('knowledges', 'tertiary')}
                  >
                    Tertiary (5)
                  </button>
                </div>
              </div>
            </div>

            {Object.values(allocation.abilityPriorities).every(p => p !== null) && (
              <div className="abilities-allocation">
                <div className="ability-category">
                  <h3>Talents ({getAbilityPointsSpent('talents')} / {getAbilityPointsAvailable('talents')} points)</h3>
                  {(ABILITY_CATEGORIES.talents).map((ability) => (
                    <div key={ability} className="stat-input">
                      <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={character.abilities[ability]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          const pointsSpent = getAbilityPointsSpent('talents') - character.abilities[ability];
                          if (pointsSpent + newValue <= getAbilityPointsAvailable('talents')) {
                            updateAbility(ability, newValue);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="ability-category">
                  <h3>Skills ({getAbilityPointsSpent('skills')} / {getAbilityPointsAvailable('skills')} points)</h3>
                  {(ABILITY_CATEGORIES.skills).map((ability) => (
                    <div key={ability} className="stat-input">
                      <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={character.abilities[ability]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          const pointsSpent = getAbilityPointsSpent('skills') - character.abilities[ability];
                          if (pointsSpent + newValue <= getAbilityPointsAvailable('skills')) {
                            updateAbility(ability, newValue);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="ability-category">
                  <h3>Knowledges ({getAbilityPointsSpent('knowledges')} / {getAbilityPointsAvailable('knowledges')} points)</h3>
                  {(ABILITY_CATEGORIES.knowledges).map((ability) => (
                    <div key={ability} className="stat-input">
                      <label>{ability.charAt(0).toUpperCase() + ability.slice(1)}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={character.abilities[ability]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          const pointsSpent = getAbilityPointsSpent('knowledges') - character.abilities[ability];
                          if (pointsSpent + newValue <= getAbilityPointsAvailable('knowledges')) {
                            updateAbility(ability, newValue);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Advantages */}
        {step === 'advantages' && (
          <div className="step-section">
            <h2>Step 4: Advantages</h2>
            <p className="step-description">
              Distribute your Sphere points (6 total), Backgrounds (7 total), and set starting values
            </p>

            <div className="advantages-grid">
              <div className="advantage-section">
                <h3>Spheres ({getTotalSpherePoints()} / {CREATION_POINTS.spheres} points)</h3>
                <p className="help-text">Choose your affinity sphere and distribute remaining points</p>
                <div className="form-field">
                  <label>Affinity Sphere</label>
                  <select
                    value={character.affinity || ''}
                    onChange={(e) => {
                      const newAffinity = e.target.value as Affinity;
                      // Reset all spheres to 0 first
                      const resetSpheres = { ...character.spheres };
                      Object.keys(resetSpheres).forEach(key => {
                        resetSpheres[key as keyof typeof resetSpheres] = 0;
                      });
                      // Set affinity sphere to 1
                      resetSpheres[newAffinity] = 1;
                      setCharacter({
                        ...character,
                        affinity: newAffinity,
                        spheres: resetSpheres,
                      });
                    }}
                  >
                    <option value="">Select Affinity...</option>
                    {SPHERE_NAMES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {SPHERE_NAMES.map((sphere) => (
                  <div key={sphere} className="stat-input">
                    <label>
                      {sphere.charAt(0).toUpperCase() + sphere.slice(1)}
                      {character.affinity === sphere && ' (Affinity)'}
                    </label>
                    <input
                      type="number"
                      min={character.affinity === sphere ? 1 : 0}
                      max="3"
                      value={character.spheres[sphere]}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        const currentTotal = getTotalSpherePoints();
                        const diff = newValue - character.spheres[sphere];
                        if (currentTotal + diff <= CREATION_POINTS.spheres && newValue >= (character.affinity === sphere ? 1 : 0)) {
                          updateSphere(sphere, newValue);
                        }
                      }}
                      disabled={!character.affinity}
                    />
                  </div>
                ))}
              </div>

              <div className="advantage-section">
                <h3>Backgrounds ({getTotalBackgroundPoints()} / {CREATION_POINTS.backgrounds} points)</h3>
                {BACKGROUND_NAMES.map((bg) => (
                  <div key={bg} className="stat-input">
                    <label>{bg.charAt(0).toUpperCase() + bg.slice(1)}</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={character.backgrounds[bg]}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value) || 0;
                        const currentTotal = getTotalBackgroundPoints();
                        const diff = newValue - character.backgrounds[bg];
                        if (currentTotal + diff <= CREATION_POINTS.backgrounds) {
                          updateBackground(bg, newValue);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="advantage-section">
                <h3>Other Advantages</h3>
                <div className="stat-input">
                  <label>Willpower (Starting: {CREATION_POINTS.willpower})</label>
                  <input
                    type="number"
                    value={character.willpower}
                    disabled
                  />
                </div>
                <div className="stat-input">
                  <label>Arete (Starting: {CREATION_POINTS.arete})</label>
                  <input
                    type="number"
                    value={character.arete}
                    disabled
                  />
                </div>
                <div className="stat-input">
                  <label>Quintessence (Max = Avatar rating)</label>
                  <input
                    type="number"
                    value={character.backgrounds.avatar}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Freebie Points */}
        {step === 'freebies' && (
          <div className="step-section">
            <h2>Step 5: Freebie Points</h2>
            <p className="step-description">
              Spend your {CREATION_POINTS.freebiePoints} freebie points to customize your character
            </p>

            <div className="freebie-display">
              <h3>Freebie Points Remaining: {freebiePoints}</h3>
            </div>

            <div className="freebie-costs">
              <p><strong>Costs:</strong> Attribute: {FREEBIE_COSTS.attribute}, Ability: {FREEBIE_COSTS.ability}, Sphere: {FREEBIE_COSTS.sphere}, Background: {FREEBIE_COSTS.background}, Arete: {FREEBIE_COSTS.arete}, Willpower: {FREEBIE_COSTS.willpower}</p>
            </div>

            <div className="freebie-grid">
              <div className="freebie-category">
                <h3>Attributes (Cost: {FREEBIE_COSTS.attribute} each)</h3>
                {Object.entries(character.attributes).map(([attr, value]) => (
                  <div key={attr} className="freebie-item">
                    <span>{attr.charAt(0).toUpperCase() + attr.slice(1)}</span>
                    <span>{value}</span>
                    <button
                      onClick={() => spendFreebiePoint('attribute', value, (v) => updateAttribute(attr as keyof Character['attributes'], v))}
                      disabled={freebiePoints < FREEBIE_COSTS.attribute || value >= 5}
                    >
                      + ({FREEBIE_COSTS.attribute} pts)
                    </button>
                  </div>
                ))}
              </div>

              <div className="freebie-category">
                <h3>Abilities (Cost: {FREEBIE_COSTS.ability} each)</h3>
                {Object.entries(character.abilities).map(([ability, value]) => (
                  <div key={ability} className="freebie-item">
                    <span>{ability.charAt(0).toUpperCase() + ability.slice(1)}</span>
                    <span>{value}</span>
                    <button
                      onClick={() => spendFreebiePoint('ability', value, (v) => updateAbility(ability as keyof Character['abilities'], v))}
                      disabled={freebiePoints < FREEBIE_COSTS.ability || value >= 5}
                    >
                      + ({FREEBIE_COSTS.ability} pts)
                    </button>
                  </div>
                ))}
              </div>

              <div className="freebie-category">
                <h3>Spheres (Cost: {FREEBIE_COSTS.sphere} each)</h3>
                {Object.entries(character.spheres).map(([sphere, value]) => (
                  <div key={sphere} className="freebie-item">
                    <span>{sphere.charAt(0).toUpperCase() + sphere.slice(1)}</span>
                    <span>{value}</span>
                    <button
                      onClick={() => spendFreebiePoint('sphere', value, (v) => updateSphere(sphere as keyof Character['spheres'], v))}
                      disabled={freebiePoints < FREEBIE_COSTS.sphere || value >= 5}
                    >
                      + ({FREEBIE_COSTS.sphere} pts)
                    </button>
                  </div>
                ))}
              </div>

              <div className="freebie-category">
                <h3>Backgrounds (Cost: {FREEBIE_COSTS.background} each)</h3>
                {Object.entries(character.backgrounds).map(([bg, value]) => (
                  <div key={bg} className="freebie-item">
                    <span>{bg.charAt(0).toUpperCase() + bg.slice(1)}</span>
                    <span>{value}</span>
                    <button
                      onClick={() => spendFreebiePoint('background', value, (v) => updateBackground(bg as keyof Character['backgrounds'], v))}
                      disabled={freebiePoints < FREEBIE_COSTS.background || value >= 5}
                    >
                      + ({FREEBIE_COSTS.background} pts)
                    </button>
                  </div>
                ))}
              </div>

              <div className="freebie-category">
                <h3>Other (Arete: {FREEBIE_COSTS.arete}, Willpower: {FREEBIE_COSTS.willpower})</h3>
                <div className="freebie-item">
                  <span>Arete</span>
                  <span>{character.arete}</span>
                  <button
                    onClick={() => spendFreebiePoint('arete', character.arete, (v) => updateCharacterField('arete', v))}
                    disabled={freebiePoints < FREEBIE_COSTS.arete || character.arete >= 5}
                  >
                    + ({FREEBIE_COSTS.arete} pts)
                  </button>
                </div>
                <div className="freebie-item">
                  <span>Willpower</span>
                  <span>{character.willpower}</span>
                  <button
                    onClick={() => {
                      if (freebiePoints >= FREEBIE_COSTS.willpower) {
                        setFreebiePoints(freebiePoints - FREEBIE_COSTS.willpower);
                        setCharacter({
                          ...character,
                          willpower: character.willpower + 1,
                          willpowerCurrent: character.willpower + 1,
                        });
                      }
                    }}
                    disabled={freebiePoints < FREEBIE_COSTS.willpower || character.willpower >= 10}
                  >
                    + ({FREEBIE_COSTS.willpower} pt)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 'review' && (
          <div className="step-section">
            <h2>Step 6: Review Your Character</h2>
            <p className="step-description">Review your character before finalizing</p>

            <div className="review-grid">
              <div className="review-section">
                <h3>Basic Info</h3>
                <p><strong>Name:</strong> {character.name}</p>
                <p><strong>Tradition:</strong> {character.tradition}</p>
                <p><strong>Essence:</strong> {character.essence}</p>
                {character.nature && <p><strong>Nature:</strong> {character.nature}</p>}
                {character.demeanor && <p><strong>Demeanor:</strong> {character.demeanor}</p>}
              </div>

              <div className="review-section">
                <h3>Attributes</h3>
                {Object.entries(character.attributes).map(([attr, value]) => (
                  <p key={attr}><strong>{attr}:</strong> {value}</p>
                ))}
              </div>

              <div className="review-section">
                <h3>Abilities</h3>
                {Object.entries(character.abilities).filter(([, v]) => v > 0).map(([ability, value]) => (
                  <p key={ability}><strong>{ability}:</strong> {value}</p>
                ))}
              </div>

              <div className="review-section">
                <h3>Spheres</h3>
                {Object.entries(character.spheres).filter(([, v]) => v > 0).map(([sphere, value]) => (
                  <p key={sphere}><strong>{sphere}:</strong> {value}</p>
                ))}
              </div>

              <div className="review-section">
                <h3>Backgrounds</h3>
                {Object.entries(character.backgrounds).filter(([, v]) => v > 0).map(([bg, value]) => (
                  <p key={bg}><strong>{bg}:</strong> {value}</p>
                ))}
              </div>

              <div className="review-section">
                <h3>Advantages</h3>
                <p><strong>Arete:</strong> {character.arete}</p>
                <p><strong>Willpower:</strong> {character.willpower}</p>
              </div>
            </div>

            <div className="freebie-summary">
              <p><strong>Freebie Points Spent:</strong> {CREATION_POINTS.freebiePoints - freebiePoints} / {CREATION_POINTS.freebiePoints}</p>
            </div>
          </div>
        )}
      </div>

      <div className="creation-footer">
        <div className="nav-buttons">
          {step !== 'concept' && (
            <button onClick={handlePrevious} className="nav-button">
              ← Previous
            </button>
          )}
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          {step !== 'review' ? (
            <button
              onClick={handleNext}
              className="nav-button"
              disabled={!canProceed()}
            >
              Next →
            </button>
          ) : (
            <button onClick={handleComplete} className="complete-button">
              Complete Character
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraditionalCreation;
