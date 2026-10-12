// MCP tools over the Emerald Nightmare file store. Importing into Unreal is
// not done here: the game's own unreal-mcp reads the exported file.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { slugify } from '../../src/emerald/contract';
import type { EmeraldCharacter } from '../../src/emerald/types';
import { StoreError } from './fileStore';
import type { EmeraldStore } from './fileStore';

const affiliationSchema = z.object({
  id: z.string().describe('Affiliation id from the affiliations catalog'),
  role: z.string().describe('Role id from the roles catalog'),
});

const editableFields = {
  name: z.string().describe('Display name'),
  nature: z.string().describe('Free text; may be empty'),
  affiliations: z
    .array(affiliationSchema)
    .describe('Affiliations, each with its role; one entry per affiliation id'),
  knownMaterials: z.array(z.string()).describe('Material ids from the materials catalog'),
  alterations: z.array(z.string()).describe('Alteration ids from the alterations catalog'),
};

const json = (data: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

/** Runs a tool body, turning store errors into MCP tool errors. */
const run = async (body: () => Promise<unknown>): Promise<CallToolResult> => {
  try {
    return json(await body());
  } catch (err) {
    const message =
      err instanceof StoreError
        ? [err.message, ...err.details].join('\n')
        : err instanceof Error
          ? err.message
          : String(err);
    return { isError: true, content: [{ type: 'text', text: message }] };
  }
};

export const createEmeraldMcpServer = (store: EmeraldStore): McpServer => {
  const server = new McpServer({ name: 'emerald-nightmare-characters', version: '0.1.0' });

  server.registerTool(
    'list_catalogs',
    {
      description:
        'List the Emerald Nightmare catalogs (paradigms, materials, alterations, affiliations, roles) as { id, label }. Characters must reference these ids.',
      annotations: { readOnlyHint: true },
    },
    () => run(() => store.loadCatalogs()),
  );

  server.registerTool(
    'list_characters',
    {
      description: 'List all Emerald Nightmare characters.',
      annotations: { readOnlyHint: true },
    },
    () => run(() => store.listCharacters()),
  );

  server.registerTool(
    'get_character',
    {
      description: 'Get one Emerald Nightmare character by id.',
      inputSchema: { id: z.string() },
      annotations: { readOnlyHint: true },
    },
    ({ id }) => run(() => store.getCharacter(id)),
  );

  server.registerTool(
    'create_character',
    {
      description:
        'Create a new Emerald Nightmare character. The id defaults to the name in snake_case. Id and paradigm are fixed once created. All ids must exist in the catalogs (see list_catalogs).',
      inputSchema: {
        id: z.string().optional().describe('Row id (snake_case). Defaults to slugified name.'),
        paradigm: z.string().describe('Paradigm id from the paradigms catalog'),
        name: editableFields.name,
        nature: editableFields.nature.optional(),
        affiliations: editableFields.affiliations.optional(),
        knownMaterials: editableFields.knownMaterials.optional(),
        alterations: editableFields.alterations.optional(),
      },
      annotations: { destructiveHint: false, idempotentHint: false },
    },
    (input) =>
      run(() =>
        store.createCharacter({
          id: input.id ?? slugify(input.name),
          name: input.name,
          nature: input.nature ?? '',
          affiliations: input.affiliations ?? [],
          paradigm: input.paradigm,
          knownMaterials: input.knownMaterials ?? [],
          alterations: input.alterations ?? [],
        }),
      ),
  );

  server.registerTool(
    'update_character',
    {
      description:
        'Update an existing Emerald Nightmare character. Omitted fields keep their current value; list fields are replaced as a whole. The id and the paradigm cannot change: a different paradigm is a different character.',
      inputSchema: {
        id: z.string().describe('Id of the character to update'),
        paradigm: z
          .string()
          .optional()
          .describe('Must equal the current paradigm if given; it cannot change'),
        name: editableFields.name.optional(),
        nature: editableFields.nature.optional(),
        affiliations: editableFields.affiliations.optional(),
        knownMaterials: editableFields.knownMaterials.optional(),
        alterations: editableFields.alterations.optional(),
      },
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    ({ id, ...patch }) =>
      run(async () => {
        const current = await store.getCharacter(id);
        const next: EmeraldCharacter = {
          ...current,
          ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)),
          id,
        };
        return store.updateCharacter(next);
      }),
  );

  server.registerTool(
    'export_for_unreal',
    {
      description:
        'Write all characters to client/export/DT_Characters.json (array of contract rows, row key = "id") and return its absolute path (always with forward slashes). Import into the Data Table is done by the game\'s unreal-mcp, not here.',
      annotations: { destructiveHint: false, idempotentHint: true },
    },
    () =>
      run(async () => {
        const { file, rows } = await store.exportForUnreal();
        // Forward slashes: the path is often pasted into Python string
        // literals on the Unreal side, where a backslash can become an escape.
        return { file: file.replace(/\\/g, '/'), count: rows.length, rows };
      }),
  );

  return server;
};
