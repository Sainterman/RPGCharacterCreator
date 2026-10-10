import React from 'react';
import type { CatalogName, Catalogs } from './types';
import { CATALOG_NAMES } from './types';
import { isValidId, slugify } from './contract';
import { ApiError, saveCatalogs } from './api';

interface CatalogEditorProps {
  catalogs: Catalogs;
  onSaved: (catalogs: Catalogs) => void;
  onClose: () => void;
}

const TITLES: Record<CatalogName, string> = {
  paradigms: 'Paradigmas',
  materials: 'Materiales',
  alterations: 'Alteraciones',
  affiliations: 'Afiliaciones',
  roles: 'Roles de afiliación',
};

interface Row {
  id: string;
  label: string;
  isNew: boolean;
}

type Draft = Record<CatalogName, Row[]>;

const toDraft = (catalogs: Catalogs): Draft =>
  Object.fromEntries(
    CATALOG_NAMES.map((n) => [n, catalogs[n].map((e) => ({ ...e, isNew: false }))]),
  ) as Draft;

const CatalogEditor: React.FC<CatalogEditorProps> = ({ catalogs, onSaved, onClose }) => {
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(catalogs));
  const [errors, setErrors] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  const updateRow = (name: CatalogName, index: number, patch: Partial<Row>) =>
    setDraft((d) => ({
      ...d,
      [name]: d[name].map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));

  const handleSave = async () => {
    setSaving(true);
    setErrors([]);
    try {
      const payload = Object.fromEntries(
        CATALOG_NAMES.map((n) => [n, draft[n].map(({ id, label }) => ({ id, label }))]),
      ) as unknown as Catalogs;
      const saved = await saveCatalogs(payload);
      setDraft(toDraft(saved));
      onSaved(saved);
    } catch (err) {
      setErrors(err instanceof ApiError ? [err.message, ...err.details] : [String(err)]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="en-editor">
      <h2>Catálogos</h2>
      <p className="en-hint">
        Los ids (inglés) son los valores que viajan a Unreal; la etiqueta (español) es solo para
        mostrar en la herramienta. Un id guardado no se edita: si un personaje lo usa, cambiarlo
        rompería la ficha.
      </p>

      {CATALOG_NAMES.map((name) => (
        <fieldset key={name} className="en-section">
          <legend>{TITLES[name]}</legend>
          {draft[name].map((row, i) => (
            <div key={i} className="en-row">
              <input
                placeholder="Etiqueta"
                value={row.label}
                onChange={(e) =>
                  updateRow(name, i, {
                    label: e.target.value,
                    ...(row.isNew ? { id: slugify(e.target.value) } : {}),
                  })
                }
              />
              <input
                className={`en-id ${isValidId(row.id) ? '' : 'is-invalid'}`}
                placeholder="id"
                value={row.id}
                disabled={!row.isNew}
                onChange={(e) => updateRow(name, i, { id: e.target.value })}
              />
              <button
                className="en-button is-quiet"
                onClick={() =>
                  setDraft((d) => ({ ...d, [name]: d[name].filter((_, j) => j !== i) }))
                }
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            className="en-button is-quiet"
            onClick={() =>
              setDraft((d) => ({ ...d, [name]: [...d[name], { id: '', label: '', isNew: true }] }))
            }
          >
            + Añadir
          </button>
        </fieldset>
      ))}

      {errors.length > 0 && (
        <ul className="en-errors">
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      <div className="en-actions">
        <button className="en-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar catálogos'}
        </button>
        <button className="en-button is-quiet" onClick={onClose}>
          Volver
        </button>
      </div>
    </div>
  );
};

export default CatalogEditor;
