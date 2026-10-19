// Local file store for Emerald Nightmare characters.
// Runs inside the Vite dev/preview server: no database, no extra process.
// Characters live in data/emerald-nightmare/characters/<id>.json (versionable
// in git); catalogs in data/emerald-nightmare/catalogs.json; the Unreal export
// is written to export/DT_Characters.json.
import fs from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';
import { buildExport, isValidId, validateCharacter } from '../src/emerald/contract';
import { CATALOG_NAMES } from '../src/emerald/types';
import type { Catalogs, EmeraldCharacter } from '../src/emerald/types';

const API = '/api/emerald';
const EXPORT_FILE = 'DT_Characters.json';

class HttpError extends Error {
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

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'El cuerpo no es JSON válido.');
  }
};

const send = (res: ServerResponse, status: number, data: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
};

const validateCatalogs = (input: unknown): string[] => {
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

export function emeraldStore(): Plugin {
  let root = '';
  const dataDir = () => path.join(root, 'data', 'emerald-nightmare');
  const charactersDir = () => path.join(dataDir(), 'characters');
  const catalogsFile = () => path.join(dataDir(), 'catalogs.json');
  const characterFile = (id: string) => {
    if (!isValidId(id)) throw new HttpError(400, `id inválido "${id}".`);
    return path.join(charactersDir(), `${id}.json`);
  };

  const loadCatalogs = () => readJson<Catalogs>(catalogsFile());

  const loadCharacters = async (): Promise<EmeraldCharacter[]> => {
    await fs.mkdir(charactersDir(), { recursive: true });
    const files = (await fs.readdir(charactersDir())).filter((f) => f.endsWith('.json')).sort();
    return Promise.all(files.map((f) => readJson<EmeraldCharacter>(path.join(charactersDir(), f))));
  };

  const assertValid = async (character: EmeraldCharacter) => {
    const errors = validateCharacter(character, await loadCatalogs());
    if (errors.length) throw new HttpError(422, 'El personaje no es válido.', errors);
  };

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = url.pathname.slice(API.length).replace(/\/+$/, '');
    const method = req.method ?? 'GET';
    const characterMatch = route.match(/^\/characters\/([^/]+)$/);

    if (route === '/catalogs' && method === 'GET') {
      return send(res, 200, await loadCatalogs());
    }
    if (route === '/catalogs' && method === 'PUT') {
      const body = await readBody(req);
      const errors = validateCatalogs(body);
      if (errors.length) throw new HttpError(422, 'Los catálogos no son válidos.', errors);
      const catalogs = Object.fromEntries(
        CATALOG_NAMES.map((n) => [
          n,
          (body as Catalogs)[n].map(({ id, label }) => ({ id, label })),
        ]),
      );
      await writeJson(catalogsFile(), catalogs);
      return send(res, 200, catalogs);
    }

    if (route === '/characters' && method === 'GET') {
      return send(res, 200, await loadCharacters());
    }
    if (route === '/characters' && method === 'POST') {
      const character = (await readBody(req)) as EmeraldCharacter;
      await assertValid(character);
      const file = characterFile(character.id);
      if (await exists(file)) {
        throw new HttpError(409, `Ya existe un personaje con id "${character.id}".`);
      }
      await writeJson(file, character);
      return send(res, 201, character);
    }
    if (characterMatch && method === 'PUT') {
      const id = decodeURIComponent(characterMatch[1]);
      const file = characterFile(id);
      if (!(await exists(file))) throw new HttpError(404, `No existe el personaje "${id}".`);
      const character = (await readBody(req)) as EmeraldCharacter;
      if (character.id !== id) {
        throw new HttpError(409, 'El id no se puede cambiar: crea un personaje nuevo.');
      }
      const current = await readJson<EmeraldCharacter>(file);
      if (current.paradigm !== character.paradigm) {
        throw new HttpError(
          409,
          'El paradigma es fijo: cambiar de paradigma es cambiar de personaje.',
        );
      }
      await assertValid(character);
      await writeJson(file, character);
      return send(res, 200, character);
    }
    if (characterMatch && method === 'DELETE') {
      const id = decodeURIComponent(characterMatch[1]);
      const file = characterFile(id);
      if (!(await exists(file))) throw new HttpError(404, `No existe el personaje "${id}".`);
      await fs.unlink(file);
      return send(res, 200, { id });
    }

    if (route === '/export' && method === 'POST') {
      const { rows, errors } = buildExport(await loadCharacters(), await loadCatalogs());
      if (errors.length) throw new HttpError(422, 'Hay personajes con errores.', errors);
      const file = path.join(root, 'export', EXPORT_FILE);
      await writeJson(file, rows);
      return send(res, 200, { file: path.relative(root, file).replace(/\\/g, '/'), rows });
    }

    throw new HttpError(404, `Ruta desconocida: ${method} ${url.pathname}`);
  };

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith(API)) return next();
    handle(req, res).catch((err: unknown) => {
      if (err instanceof HttpError) {
        send(res, err.status, { error: err.message, details: err.details });
      } else {
        send(res, 500, { error: err instanceof Error ? err.message : String(err), details: [] });
      }
    });
  };

  return {
    name: 'emerald-store',
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
