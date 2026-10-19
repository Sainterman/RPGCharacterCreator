import { describe, expect, it } from 'vitest';
import catalogs from '../../data/emerald-nightmare/catalogs.json';
import kaelJson from '../../data/emerald-nightmare/characters/kael.json';
import { buildExport, slugify, toContractRow, validateCharacter } from './contract';
import type { EmeraldCharacter } from './types';

const kael = kaelJson as EmeraldCharacter;

const contractKael = {
  id: 'kael',
  name: 'Kael',
  nature: '',
  affiliations: [
    { id: 'alchemist_order', relation: 'ally' },
    { id: 'verum_veritas', relation: 'ally' },
    { id: 'inquisition', relation: 'enemy' },
    { id: 'null_arcanum', relation: 'enemy' },
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
        { id: 'alchemist_order', relation: 'ally' },
        { id: 'alchemist_order', relation: 'enemy' },
      ],
      knownMaterials: ['stone', 'stone', 'glass'],
    };
    const errors = validateCharacter(bad, catalogs);
    expect(errors.some((e) => e.includes('"time"'))).toBe(true);
    expect(errors.some((e) => e.includes('repetida'))).toBe(true);
    expect(errors.some((e) => e.includes('"glass"'))).toBe(true);
    expect(errors.some((e) => e.includes('materiales repetidos'))).toBe(true);
  });

  it('rejects an invalid relation', () => {
    const bad = {
      ...kael,
      affiliations: [{ id: 'inquisition', relation: 'neutral' }],
    } as unknown as EmeraldCharacter;
    const errors = validateCharacter(bad, catalogs);
    expect(errors.some((e) => e.includes('relation') && e.includes('"neutral"'))).toBe(true);
  });

  it('rejects knownMaterials when the paradigm is not matter', () => {
    const errors = validateCharacter(
      { ...kael, paradigm: 'time', knownMaterials: ['stone'] },
      { ...catalogs, paradigms: [...catalogs.paradigms, { id: 'time', label: 'Tiempo' }] },
    );
    expect(errors.some((e) => e.includes('solo aplica al paradigma matter'))).toBe(true);
    expect(
      validateCharacter(
        { ...kael, paradigm: 'time', knownMaterials: [] },
        { ...catalogs, paradigms: [...catalogs.paradigms, { id: 'time', label: 'Tiempo' }] },
      ),
    ).toEqual([]);
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

  it('does not export the legacy role key', () => {
    const { rows } = buildExport([kael], catalogs);
    expect(JSON.stringify(rows)).not.toContain('"role"');
    expect(rows[0].affiliations.every((a) => 'relation' in a && !('role' in a))).toBe(true);
  });

  it('reports duplicate ids', () => {
    const { errors } = buildExport([kael, kael], catalogs);
    expect(errors).toContain('kael: id repetido.');
  });
});
