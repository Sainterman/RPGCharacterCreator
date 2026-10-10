// HTTP layer over the shared Emerald Nightmare file store.
// Runs inside the Vite dev/preview server: no database, no extra process.
// The file logic lives in server/emerald/fileStore.ts (also used by the MCP).
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';
import { createEmeraldStore, StoreError } from '../server/emerald/fileStore';
import type { EmeraldStore } from '../server/emerald/fileStore';
import type { EmeraldCharacter } from '../src/emerald/types';

const API = '/api/emerald';

const readBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new StoreError(400, 'El cuerpo no es JSON válido.');
  }
};

const send = (res: ServerResponse, status: number, data: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
};

export function emeraldStore(): Plugin {
  let root = '';
  let store: EmeraldStore;

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = url.pathname.slice(API.length).replace(/\/+$/, '');
    const method = req.method ?? 'GET';
    const characterMatch = route.match(/^\/characters\/([^/]+)$/);

    if (route === '/catalogs' && method === 'GET') {
      return send(res, 200, await store.loadCatalogs());
    }
    if (route === '/catalogs' && method === 'PUT') {
      return send(res, 200, await store.saveCatalogs(await readBody(req)));
    }

    if (route === '/characters' && method === 'GET') {
      return send(res, 200, await store.listCharacters());
    }
    if (route === '/characters' && method === 'POST') {
      const character = (await readBody(req)) as EmeraldCharacter;
      return send(res, 201, await store.createCharacter(character));
    }
    if (characterMatch && method === 'PUT') {
      const id = decodeURIComponent(characterMatch[1]);
      const character = (await readBody(req)) as EmeraldCharacter;
      if (character.id !== id) {
        throw new StoreError(409, 'El id no se puede cambiar: crea un personaje nuevo.');
      }
      return send(res, 200, await store.updateCharacter(character));
    }
    if (characterMatch && method === 'DELETE') {
      const id = decodeURIComponent(characterMatch[1]);
      await store.deleteCharacter(id);
      return send(res, 200, { id });
    }

    if (route === '/export' && method === 'POST') {
      const { file, rows } = await store.exportForUnreal();
      return send(res, 200, { file: path.relative(root, file).replace(/\\/g, '/'), rows });
    }

    throw new StoreError(404, `Ruta desconocida: ${method} ${url.pathname}`);
  };

  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith(API)) return next();
    handle(req, res).catch((err: unknown) => {
      if (err instanceof StoreError) {
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
      store = createEmeraldStore(root);
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
