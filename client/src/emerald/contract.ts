// Pure helpers shared by the browser UI and the Vite file-store plugin.
// Must not touch the DOM or Node APIs.
import type { Catalogs, CatalogName, EmeraldCharacter } from './types';

export const ID_PATTERN = /^[a-z][a-z0-9_]*$/;

export const isValidId = (id: string): boolean => ID_PATTERN.test(id);

/** "Kael de Cairo" -> "kael_de_cairo" */
export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+/, '')
    .replace(/_+$/, '');

export const createEmptyEmeraldCharacter = (): EmeraldCharacter => ({
  id: '',
  name: '',
  nature: '',
  affiliations: [],
  paradigm: '',
  knownMaterials: [],
  alterations: [],
});

/** Returns the row exactly as it crosses to Unreal, with stable key order. */
export const toContractRow = (c: EmeraldCharacter): EmeraldCharacter => ({
  id: c.id,
  name: c.name,
  nature: c.nature,
  affiliations: c.affiliations.map(({ id, role }) => ({ id, role })),
  paradigm: c.paradigm,
  knownMaterials: [...c.knownMaterials],
  alterations: [...c.alterations],
});

/** Shape checks only; used by the store before writing a file. */
export const validateShape = (c: unknown): string[] => {
  const errors: string[] = [];
  const o = c as Record<string, unknown> | null;
  if (!o || typeof o !== 'object') return ['El personaje no es un objeto.'];
  for (const key of ['id', 'name', 'nature', 'paradigm']) {
    if (typeof o[key] !== 'string') errors.push(`"${key}" debe ser texto.`);
  }
  for (const key of ['knownMaterials', 'alterations']) {
    const v = o[key];
    if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) {
      errors.push(`"${key}" debe ser una lista de ids.`);
    }
  }
  const aff = o.affiliations;
  if (
    !Array.isArray(aff) ||
    !aff.every(
      (a) => a && typeof a === 'object' && typeof a.id === 'string' && typeof a.role === 'string',
    )
  ) {
    errors.push('"affiliations" debe ser una lista de { id, role }.');
  }
  return errors;
};

const checkRef = (
  errors: string[],
  catalogs: Catalogs,
  catalog: CatalogName,
  id: string,
  field: string,
) => {
  if (!catalogs[catalog].some((e) => e.id === id)) {
    errors.push(`${field}: "${id}" no existe en el catálogo ${catalog}.`);
  }
};

/** Full validation: shape, ids and references to the catalogs. */
export const validateCharacter = (c: EmeraldCharacter, catalogs: Catalogs): string[] => {
  const errors = validateShape(c);
  if (errors.length) return errors;

  if (!isValidId(c.id)) {
    errors.push('id: usa minúsculas, números y "_", empezando por letra.');
  }
  if (!c.name.trim()) errors.push('name: el nombre es obligatorio.');
  if (!c.paradigm) {
    errors.push('paradigm: elige un paradigma.');
  } else {
    checkRef(errors, catalogs, 'paradigms', c.paradigm, 'paradigm');
  }

  const seenAffiliations = new Set<string>();
  for (const a of c.affiliations) {
    if (seenAffiliations.has(a.id)) errors.push(`affiliations: "${a.id}" está repetida.`);
    seenAffiliations.add(a.id);
    checkRef(errors, catalogs, 'affiliations', a.id, 'affiliations');
    checkRef(errors, catalogs, 'roles', a.role, `role de "${a.id}"`);
  }
  for (const m of new Set(c.knownMaterials)) checkRef(errors, catalogs, 'materials', m, 'knownMaterials');
  for (const a of new Set(c.alterations)) checkRef(errors, catalogs, 'alterations', a, 'alterations');
  if (new Set(c.knownMaterials).size !== c.knownMaterials.length) {
    errors.push('knownMaterials: hay materiales repetidos.');
  }
  if (new Set(c.alterations).size !== c.alterations.length) {
    errors.push('alterations: hay alteraciones repetidas.');
  }
  return errors;
};

/**
 * Builds the Data Table file: an array with one row per character, sorted by id.
 * In Unreal, set the Data Table's Import Key Field to "id".
 */
export const buildExport = (
  characters: EmeraldCharacter[],
  catalogs: Catalogs,
): { rows: EmeraldCharacter[]; errors: string[] } => {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const c of characters) {
    if (ids.has(c.id)) errors.push(`${c.id}: id repetido.`);
    ids.add(c.id);
    for (const e of validateCharacter(c, catalogs)) errors.push(`${c.id || '(sin id)'}: ${e}`);
  }
  const rows = [...characters].sort((a, b) => a.id.localeCompare(b.id)).map(toContractRow);
  return { rows, errors };
};
