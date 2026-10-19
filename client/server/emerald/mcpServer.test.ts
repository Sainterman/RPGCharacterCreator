import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createEmeraldStore } from './fileStore';
import { createEmeraldMcpServer } from './mcpServer';

const clientRoot = path.resolve(__dirname, '..', '..');

let root: string;
let client: Client;

const call = async (name: string, args: Record<string, unknown> = {}) => {
  const result = (await client.callTool({ name, arguments: args })) as CallToolResult;
  const text = result.content[0]?.type === 'text' ? result.content[0].text : '';
  return { isError: result.isError === true, text, data: result.isError ? null : JSON.parse(text) };
};

beforeEach(async () => {
  // Work on a copy of the sample data so tests never touch the real files.
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'emerald-mcp-'));
  await fs.cp(path.join(clientRoot, 'data'), path.join(root, 'data'), { recursive: true });

  const server = createEmeraldMcpServer(createEmeraldStore(root));
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: 'test', version: '0.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterEach(async () => {
  await client.close();
  await fs.rm(root, { recursive: true, force: true });
});

describe('emerald MCP server', () => {
  it('exposes exactly the six agreed tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'create_character',
      'export_for_unreal',
      'get_character',
      'list_catalogs',
      'list_characters',
      'update_character',
    ]);
  });

  it('lists catalogs and characters, and gets one by id', async () => {
    expect((await call('list_catalogs')).data.paradigms).toEqual([
      { id: 'matter', label: 'Materia' },
    ]);
    expect((await call('list_characters')).data.map((c: { id: string }) => c.id)).toEqual([
      'kael',
    ]);
    expect((await call('get_character', { id: 'kael' })).data.paradigm).toBe('matter');
    expect((await call('get_character', { id: 'nobody' })).isError).toBe(true);
  });

  it('creates a character, defaulting the id from the name', async () => {
    const created = await call('create_character', {
      name: 'Isadora Vélez',
      paradigm: 'matter',
      knownMaterials: ['water'],
      affiliations: [{ id: 'alchemist_order', relation: 'ally' }],
    });
    expect(created.isError).toBe(false);
    expect(created.data).toEqual({
      id: 'isadora_velez',
      name: 'Isadora Vélez',
      nature: '',
      affiliations: [{ id: 'alchemist_order', relation: 'ally' }],
      paradigm: 'matter',
      knownMaterials: ['water'],
      alterations: [],
    });
    const file = path.join(root, 'data', 'emerald-nightmare', 'characters', 'isadora_velez.json');
    expect(JSON.parse(await fs.readFile(file, 'utf8')).name).toBe('Isadora Vélez');
  });

  it('rejects duplicates and ids missing from the catalogs', async () => {
    const duplicate = await call('create_character', { name: 'Kael', paradigm: 'matter' });
    expect(duplicate.isError).toBe(true);
    expect(duplicate.text).toContain('Ya existe');

    const unknown = await call('create_character', { name: 'Isadora', paradigm: 'spirit' });
    expect(unknown.isError).toBe(true);
    expect(unknown.text).toContain('"spirit" no existe en el catálogo paradigms');
  });

  it('updates only the given fields', async () => {
    const updated = await call('update_character', {
      id: 'kael',
      nature: 'Curioso',
      knownMaterials: ['stone'],
    });
    expect(updated.isError).toBe(false);
    expect(updated.data.nature).toBe('Curioso');
    expect(updated.data.knownMaterials).toEqual(['stone']);
    expect(updated.data.alterations).toEqual(['remove', 'add', 'relocate']);
  });

  it('keeps the paradigm fixed on update', async () => {
    const catalogsFile = path.join(root, 'data', 'emerald-nightmare', 'catalogs.json');
    const catalogs = JSON.parse(await fs.readFile(catalogsFile, 'utf8'));
    catalogs.paradigms.push({ id: 'spirit', label: 'Espíritu' });
    await fs.writeFile(catalogsFile, JSON.stringify(catalogs));

    const changed = await call('update_character', { id: 'kael', paradigm: 'spirit' });
    expect(changed.isError).toBe(true);
    expect(changed.text).toContain('El paradigma es fijo');

    const same = await call('update_character', { id: 'kael', paradigm: 'matter', name: 'Kael' });
    expect(same.isError).toBe(false);
    expect((await call('get_character', { id: 'kael' })).data.paradigm).toBe('matter');
  });

  it('cannot update a character that does not exist (id is fixed)', async () => {
    const result = await call('update_character', { id: 'kael_2', name: 'Kael' });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('No existe');
  });

  it('exports the Data Table file and returns its absolute path', async () => {
    await call('create_character', { name: 'Isadora', paradigm: 'matter' });
    const exported = await call('export_for_unreal');
    expect(exported.isError).toBe(false);
    expect(exported.data.file).toBe(
      path.join(root, 'export', 'DT_Characters.json').replace(/\\/g, '/'),
    );
    expect(exported.data.file).not.toContain('\\');
    expect(path.isAbsolute(exported.data.file)).toBe(true);
    expect(exported.data.count).toBe(2);

    const rows = JSON.parse(await fs.readFile(exported.data.file, 'utf8'));
    expect(rows.map((r: { id: string }) => r.id)).toEqual(['isadora', 'kael']);
    expect(Object.keys(rows[1])).toEqual([
      'id',
      'name',
      'nature',
      'affiliations',
      'paradigm',
      'knownMaterials',
      'alterations',
    ]);
  });

  it('refuses to export when a character is invalid', async () => {
    const bad = path.join(root, 'data', 'emerald-nightmare', 'characters', 'broken.json');
    await fs.writeFile(
      bad,
      JSON.stringify({
        id: 'broken',
        name: '',
        nature: '',
        affiliations: [],
        paradigm: 'matter',
        knownMaterials: [],
        alterations: [],
      }),
    );
    const exported = await call('export_for_unreal');
    expect(exported.isError).toBe(true);
    expect(exported.text).toContain('broken: name');
  });
});
