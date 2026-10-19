// File-backed store for Emerald Nightmare characters, shared by the Vite
// plugin (browser UI) and the MCP server. Plain Node: no Vite, no database.
// Characters live in data/emerald-nightmare/characters/<id>.json; catalogs in
// data/emerald-nightmare/catalogs.json; the Unreal export is written to
// export/DT_Characters.json. All paths are relative to `root` (the client dir).
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildExport, isValidId, validateCharacter } from '../../src/emerald/contract';
import { CATALOG_NAMES } from '../../src/emerald/types';
import type { Catalogs, EmeraldCharacter } from '../../src/emerald/types';

export const EXPORT_FILE = 'DT_Characters.json';

export class StoreError extends Error {
  status: number;
  details: string[];
  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(await fs.readFile(file, 'utf8')) as T;

const writeJson = async (file: string, data: unknown) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
};

const exists = (file: string) =>
  fs.access(file).then(
    () => true,
    () => false,
  );

export const validateCatalogs = (input: unknown): string[] => {
  const errors: string[] = [];
  const o = input as Record<string, unknown> | null;
  if (!o || typeof o !== 'object') return ['Los catálogos deben ser un objeto.'];
  for (const name of CATALOG_NAMES) {
    const list = o[name];
    if (!Array.isArray(list)) {
      errors.push(`${name}: debe ser una lista.`);
      continue;
    }
    const seen = new Set<string>();
    for (const entry of list) {
      if (!entry || typeof entry.id !== 'string' || typeof entry.label !== 'string') {
        errors.push(`${name}: cada entrada necesita id y label.`);
        continue;
      }
      if (!isValidId(entry.id)) errors.push(`${name}: id inválido "${entry.id}".`);
      if (seen.has(entry.id)) errors.push(`${name}: id repetido "${entry.id}".`);
      seen.add(entry.id);
    }
  }
  return errors;
};

export interface EmeraldStore {
  /** Absolute path of the export file. */
  exportFile: string;
  loadCatalogs(): Promise<Catalogs>;
  saveCatalogs(input: unknown): Promise<Catalogs>;
  listCharacters(): Promise<EmeraldCharacter[]>;
  getCharacter(id: string): Promise<EmeraldCharacter>;
  createCharacter(character: EmeraldCharacter): Promise<EmeraldCharacter>;
  /** Replaces an existing character; id and paradigm are fixed. */
  updateCharacter(character: EmeraldCharacter): Promise<EmeraldCharacter>;
  deleteCharacter(id: string): Promise<void>;
  /** Writes the Data Table file and returns its absolute path and rows. */
  exportForUnreal(): Promise<{ file: string; rows: EmeraldCharacter[] }>;
}

export const createEmeraldStore = (root: string): EmeraldStore => {
  const dataDir = path.join(root, 'data', 'emerald-nightmare');
  const charactersDir = path.join(dataDir, 'characters');
  const catalogsFile = path.join(dataDir, 'catalogs.json');
  const exportFile = path.join(root, 'export', EXPORT_FILE);

  const characterFile = (id: string) => {
    if (!isValidId(id)) throw new StoreError(400, `id inválido "${id}".`);
    return path.join(charactersDir, `${id}.json`);
  };

  const loadCatalogs = () => readJson<Catalogs>(catalogsFile);

  const listCharacters = async (): Promise<EmeraldCharacter[]> => {
    await fs.mkdir(charactersDir, { recursive: true });
    const files = (await fs.readdir(charactersDir)).filter((f) => f.endsWith('.json')).sort();
    return Promise.all(files.map((f) => readJson<EmeraldCharacter>(path.join(charactersDir, f))));
  };

  const readExisting = async (id: string) => {
    const file = characterFile(id);
    if (!(await exists(file))) throw new StoreError(404, `No existe el personaje "${id}".`);
    return { file, character: await readJson<EmeraldCharacter>(file) };
  };

  const assertValid = async (character: EmeraldCharacter) => {
    const errors = validateCharacter(character, await loadCatalogs());
    if (errors.length) throw new StoreError(422, 'El personaje no es válido.', errors);
  };

  return {
    exportFile,
    loadCatalogs,

    async saveCatalogs(input) {
      const errors = validateCatalogs(input);
      if (errors.length) throw new StoreError(422, 'Los catálogos no son válidos.', errors);
      const catalogs = Object.fromEntries(
        CATALOG_NAMES.map((n) => [n, (input as Catalogs)[n].map(({ id, label }) => ({ id, label }))]),
      ) as unknown as Catalogs;
      await writeJson(catalogsFile, catalogs);
      return catalogs;
    },

    listCharacters,

    async getCharacter(id) {
      return (await readExisting(id)).character;
    },

    async createCharacter(character) {
      await assertValid(character);
      const file = characterFile(character.id);
      if (await exists(file)) {
        throw new StoreError(409, `Ya existe un personaje con id "${character.id}".`);
      }
      await writeJson(file, character);
      return character;
    },

    async updateCharacter(character) {
      const { file, character: current } = await readExisting(character.id);
      if (current.paradigm !== character.paradigm) {
        throw new StoreError(
          409,
          'El paradigma es fijo: cambiar de paradigma es cambiar de personaje.',
        );
      }
      await assertValid(character);
      await writeJson(file, character);
      return character;
    },

    async deleteCharacter(id) {
      const { file } = await readExisting(id);
      await fs.unlink(file);
    },

    async exportForUnreal() {
      const { rows, errors } = buildExport(await listCharacters(), await loadCatalogs());
      if (errors.length) throw new StoreError(422, 'Hay personajes con errores.', errors);
      await writeJson(exportFile, rows);
      return { file: exportFile, rows };
    },
  };
};
