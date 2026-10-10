import React from 'react';
import type { Affiliation, Catalogs, CatalogEntry, EmeraldCharacter } from './types';
import { slugify, toContractRow, validateCharacter } from './contract';
import { ApiError, createCharacter, updateCharacter } from './api';

interface CharacterEditorProps {
  character: EmeraldCharacter;
  isNew: boolean;
  catalogs: Catalogs;
  onSaved: () => void;
  onCancel: () => void;
}

const labelOf = (entries: CatalogEntry[], id: string) =>
  entries.find((e) => e.id === id)?.label ?? id;

interface ChecklistProps {
  title: string;
  hint: string;
  entries: CatalogEntry[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ title, hint, entries, selected, onChange }) => {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  // Keep ids no longer in the catalog visible so they can be removed.
  const orphaned = selected.filter((id) => !entries.some((e) => e.id === id));
  return (
    <fieldset className="en-section">
      <legend>{title}</legend>
      <p className="en-hint">{hint}</p>
      {entries.length === 0 && <p className="en-hint">El catálogo está vacío.</p>}
      <div className="en-chips">
        {entries.map((e) => (
          <label key={e.id} className={`en-chip ${selected.includes(e.id) ? 'is-on' : ''}`}>
            <input type="checkbox" checked={selected.includes(e.id)} onChange={() => toggle(e.id)} />
            {e.label} <code>{e.id}</code>
          </label>
        ))}
        {orphaned.map((id) => (
          <label key={id} className="en-chip is-on is-missing">
            <input type="checkbox" checked onChange={() => toggle(id)} />
            <code>{id}</code> (no está en el catálogo)
          </label>
        ))}
      </div>
    </fieldset>
  );
};

const CharacterEditor: React.FC<CharacterEditorProps> = ({
  character,
  isNew,
  catalogs,
  onSaved,
  onCancel,
}) => {
  const [draft, setDraft] = React.useState<EmeraldCharacter>(character);
  const [idTouched, setIdTouched] = React.useState(!isNew || character.id !== '');
  const [serverErrors, setServerErrors] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  const errors = validateCharacter(draft, catalogs);
  const set = <K extends keyof EmeraldCharacter>(key: K, value: EmeraldCharacter[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleName = (name: string) =>
    setDraft((d) => ({ ...d, name, id: isNew && !idTouched ? slugify(name) : d.id }));

  const setAffiliations = (affiliations: Affiliation[]) => set('affiliations', affiliations);
  const unusedAffiliations = catalogs.affiliations.filter(
    (a) => !draft.affiliations.some((x) => x.id === a.id),
  );
  const addAffiliation = () => {
    const next = unusedAffiliations[0];
    if (!next) return;
    setAffiliations([...draft.affiliations, { id: next.id, role: catalogs.roles[0]?.id ?? '' }]);
  };

  const handleSave = async () => {
    setSaving(true);
    setServerErrors([]);
    try {
      await (isNew ? createCharacter(draft) : updateCharacter(draft));
      onSaved();
    } catch (err) {
      setServerErrors(
        err instanceof ApiError ? [err.message, ...err.details] : [String(err)],
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="en-editor">
      <h2>{isNew ? 'Nuevo personaje' : draft.name || draft.id}</h2>

      <fieldset className="en-section">
        <legend>Identidad</legend>
        <div className="en-grid">
          <label>
            <span>Nombre <code>name</code></span>
            <input value={draft.name} onChange={(e) => handleName(e.target.value)} />
          </label>
          <label>
            <span>Id <code>id</code></span>
            <input
              value={draft.id}
              disabled={!isNew}
              onChange={(e) => {
                setIdTouched(true);
                set('id', e.target.value);
              }}
            />
            <span className="en-hint">
              {isNew
                ? 'Clave de la fila en Unreal. Se genera del nombre; no se puede cambiar después de guardar.'
                : 'Fijo: cambiar el id es crear otro personaje.'}
            </span>
          </label>
          <label>
            <span>Naturaleza <code>nature</code></span>
            <input value={draft.nature} onChange={(e) => set('nature', e.target.value)} />
            <span className="en-hint">Texto libre; puede quedar vacío.</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="en-section">
        <legend>Paradigma</legend>
        {isNew ? (
          <>
            <p className="en-hint">
              Un personaje, un paradigma, fijo. Después de guardar no se puede cambiar.
            </p>
            <div className="en-chips">
              {catalogs.paradigms.map((p) => (
                <label key={p.id} className={`en-chip ${draft.paradigm === p.id ? 'is-on' : ''}`}>
                  <input
                    type="radio"
                    name="paradigm"
                    checked={draft.paradigm === p.id}
                    onChange={() => set('paradigm', p.id)}
                  />
                  {p.label} <code>{p.id}</code>
                </label>
              ))}
            </div>
          </>
        ) : (
          <p>
            <strong>{labelOf(catalogs.paradigms, draft.paradigm)}</strong>{' '}
            <code>{draft.paradigm}</code>{' '}
            <span className="en-hint">— cambiar de paradigma es cambiar de personaje.</span>
          </p>
        )}
      </fieldset>

      <Checklist
        title="Materiales conocidos"
        hint="La lista crece con la historia del personaje."
        entries={catalogs.materials}
        selected={draft.knownMaterials}
        onChange={(ids) => set('knownMaterials', ids)}
      />

      <Checklist
        title="Alteraciones"
        hint="Alteraciones que el personaje sabe hacer."
        entries={catalogs.alterations}
        selected={draft.alterations}
        onChange={(ids) => set('alterations', ids)}
      />

      <fieldset className="en-section">
        <legend>Afiliaciones</legend>
        {draft.affiliations.length === 0 && <p className="en-hint">Sin afiliaciones.</p>}
        {draft.affiliations.map((a, i) => (
          <div key={i} className="en-row">
            <select
              value={a.id}
              onChange={(e) =>
                setAffiliations(
                  draft.affiliations.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)),
                )
              }
            >
              {!catalogs.affiliations.some((c) => c.id === a.id) && (
                <option value={a.id}>{a.id} (no está en el catálogo)</option>
              )}
              {catalogs.affiliations
                .filter((c) => c.id === a.id || !draft.affiliations.some((x) => x.id === c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
            </select>
            <select
              value={a.role}
              onChange={(e) =>
                setAffiliations(
                  draft.affiliations.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)),
                )
              }
            >
              {!catalogs.roles.some((r) => r.id === a.role) && (
                <option value={a.role}>{a.role || '—'} (no está en el catálogo)</option>
              )}
              {catalogs.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              className="en-button is-quiet"
              onClick={() => setAffiliations(draft.affiliations.filter((_, j) => j !== i))}
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          className="en-button is-quiet"
          onClick={addAffiliation}
          disabled={unusedAffiliations.length === 0}
        >
          + Añadir afiliación
        </button>
      </fieldset>

      <fieldset className="en-section">
        <legend>Lo que cruza a Unreal</legend>
        <pre className="en-preview">{JSON.stringify(toContractRow(draft), null, 2)}</pre>
      </fieldset>

      {(errors.length > 0 || serverErrors.length > 0) && (
        <ul className="en-errors">
          {[...serverErrors, ...errors].map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      <div className="en-actions">
        <button className="en-button" onClick={handleSave} disabled={saving || errors.length > 0}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button className="en-button is-quiet" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default CharacterEditor;
