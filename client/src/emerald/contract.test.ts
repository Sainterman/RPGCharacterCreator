import { describe, expect, it } from 'vitest';
import catalogs from '../../data/emerald-nightmare/catalogs.json';
import kael from '../../data/emerald-nightmare/characters/kael.json';
import { buildExport, slugify, toContractRow, validateCharacter } from './contract';
import type { EmeraldCharacter } from './types';

const contractKael = {
  id: 'kael',
  name: 'Kael',
  nature: '',
  affiliations: [
    { id: 'cairo_hermetic_order', role: 'origin' },
    { id: 'alchemist_order', role: 'ally' },
  ],
  paradigm: 'matter',
  knownMaterials: ['stone', 'water', 'metal'],
  alterations: ['remove', 'add', 'relocate'],
};

describe('slugify', () => {
  it('builds English-style identifiers from display names', () => {
    expect(slugify('Kael')).toBe('kael');
    expect(slugify('Orden Hermética de El Cairo')).toBe('orden_hermetica_de_el_cairo');
    expect(slugify('  3 Ñandúes!  ')).toBe('nandues');
  });
});

describe('toContractRow', () => {
  it('keeps only contract fields, in contract order', () => {
    const extra = { ...kael, notes: 'tool only' } as EmeraldCharacter;
    const row = toContractRow(extra);
    expect(row).toEqual(contractKael);
    expect(Object.keys(row)).toEqual(Object.keys(contractKael));
  });
});

describe('validateCharacter', () => {
  it('accepts the sample character', () => {
    expect(validateCharacter(kael, catalogs)).toEqual([]);
  });

  it('rejects unknown catalog ids and duplicate affiliations', () => {
    const bad: EmeraldCharacter = {
      ...kael,
      paradigm: 'time',
      affiliations: [
        { id: 'alchemist_order', role: 'ally' },
        { id: 'alchemist_order', role: 'enemy' },
      ],
      knownMaterials: ['stone', 'stone', 'glass'],
    };
    const errors = validateCharacter(bad, catalogs);
    expect(errors.some((e) => e.includes('"time"'))).toBe(true);
    expect(errors.some((e) => e.includes('repetida'))).toBe(true);
    expect(errors.some((e) => e.includes('"enemy"'))).toBe(true);
    expect(errors.some((e) => e.includes('"glass"'))).toBe(true);
    expect(errors.some((e) => e.includes('materiales repetidos'))).toBe(true);
  });

  it('rejects ids that are not identifiers', () => {
    const errors = validateCharacter({ ...kael, id: 'Kael Prime' }, catalogs);
    expect(errors[0]).toMatch(/^id:/);
  });
});

describe('buildExport', () => {
  it('produces a sorted array of contract rows', () => {
    const zara = { ...kael, id: 'zara', name: 'Zara' };
    const { rows, errors } = buildExport([zara, kael], catalogs);
    expect(errors).toEqual([]);
    expect(rows.map((r) => r.id)).toEqual(['kael', 'zara']);
    expect(rows[0]).toEqual(contractKael);
  });

  it('reports duplicate ids', () => {
    const { errors } = buildExport([kael, kael], catalogs);
    expect(errors).toContain('kael: id repetido.');
  });
});
