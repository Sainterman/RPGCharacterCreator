import React from 'react';
import type { Catalogs, EmeraldCharacter } from './types';
import { createEmptyEmeraldCharacter, validateCharacter } from './contract';
import { ApiError, deleteCharacter, exportForUnreal, fetchCatalogs, fetchCharacters } from './api';
import CharacterEditor from './CharacterEditor';
import CatalogEditor from './CatalogEditor';
import './Emerald.css';

type View =
  | { kind: 'list' }
  | { kind: 'edit'; character: EmeraldCharacter; isNew: boolean }
  | { kind: 'catalogs' };

interface ExportResult {
  file?: string;
  json?: string;
  errors: string[];
}

const labelOf = (catalogs: Catalogs, id: string) =>
  catalogs.paradigms.find((p) => p.id === id)?.label ?? id;

const downloadJson = (json: string) => {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'DT_Characters.json';
  a.click();
  URL.revokeObjectURL(url);
};

const EmeraldApp: React.FC = () => {
  const [view, setView] = React.useState<View>({ kind: 'list' });
  const [catalogs, setCatalogs] = React.useState<Catalogs | null>(null);
  const [characters, setCharacters] = React.useState<EmeraldCharacter[]>([]);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [exportResult, setExportResult] = React.useState<ExportResult | null>(null);

  const load = React.useCallback(async () => {
    try {
      const [cats, chars] = await Promise.all([fetchCatalogs(), fetchCharacters()]);
      setCatalogs(cats);
      setCharacters(chars);
      setLoadError(null);
    } catch (err) {
      setLoadError(
        `${err instanceof Error ? err.message : String(err)}. ` +
          'La ficha de Emerald Nightmare necesita el servidor local (npm run dev).',
      );
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`¿Borrar el personaje "${id}"? Se elimina su archivo JSON.`)) return;
    await deleteCharacter(id);
    load();
  };

  const handleExport = async () => {
    try {
      const { file, rows } = await exportForUnreal();
      setExportResult({ file, json: JSON.stringify(rows, null, 2) + '\n', errors: [] });
    } catch (err) {
      setExportResult({
        errors: err instanceof ApiError ? [err.message, ...err.details] : [String(err)],
      });
    }
  };

  if (loadError) return <div className="en-app"><p className="en-errors">{loadError}</p></div>;
  if (!catalogs) return <div className="en-app"><p>Cargando…</p></div>;

  if (view.kind === 'edit') {
    return (
      <div className="en-app">
        <CharacterEditor
          character={view.character}
          isNew={view.isNew}
          catalogs={catalogs}
          onSaved={() => {
            setView({ kind: 'list' });
            load();
          }}
          onCancel={() => setView({ kind: 'list' })}
        />
      </div>
    );
  }

  if (view.kind === 'catalogs') {
    return (
      <div className="en-app">
        <CatalogEditor
          catalogs={catalogs}
          onSaved={setCatalogs}
          onClose={() => {
            setView({ kind: 'list' });
            load();
          }}
        />
      </div>
    );
  }

  return (
    <div className="en-app">
      <h1>Emerald Nightmare — Personajes</h1>
      <div className="en-actions">
        <button
          className="en-button"
          onClick={() =>
            setView({ kind: 'edit', character: createEmptyEmeraldCharacter(), isNew: true })
          }
        >
          Nuevo personaje
        </button>
        <button className="en-button is-quiet" onClick={() => setView({ kind: 'catalogs' })}>
          Catálogos
        </button>
        <button className="en-button is-quiet" onClick={handleExport}>
          Exportar para Unreal
        </button>
      </div>

      {exportResult && (
        <div className={`en-export ${exportResult.errors.length ? 'is-error' : ''}`}>
          {exportResult.errors.length > 0 ? (
            <ul className="en-errors">
              {exportResult.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <>
              <p>
                Exportado a <code>client/{exportResult.file}</code>. En Unreal: reimporta el Data
                Table (Import Key Field = <code>id</code>).
              </p>
              <button
                className="en-button is-quiet"
                onClick={() => exportResult.json && downloadJson(exportResult.json)}
              >
                Descargar copia
              </button>
            </>
          )}
        </div>
      )}

      {characters.length === 0 ? (
        <p className="en-hint">Aún no hay personajes.</p>
      ) : (
        <div className="en-cards">
          {characters.map((c) => {
            const problems = validateCharacter(c, catalogs).length;
            return (
              <div
                key={c.id}
                className="en-card"
                onClick={() => setView({ kind: 'edit', character: c, isNew: false })}
              >
                <div className="en-card-header">
                  <h2>{c.name || c.id}</h2>
                  <button
                    className="en-delete"
                    title="Borrar"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.id);
                    }}
                  >
                    ×
                  </button>
                </div>
                <p>
                  <code>{c.id}</code> · {labelOf(catalogs, c.paradigm)}
                </p>
                <p className="en-hint">
                  {c.knownMaterials.length} materiales · {c.alterations.length} alteraciones ·{' '}
                  {c.affiliations.length} afiliaciones
                </p>
                {problems > 0 && <p className="en-warning">{problems} problema(s) por revisar</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmeraldApp;
