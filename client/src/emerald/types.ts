// Emerald Nightmare character model.
// A character is a lens on reality (its paradigm), not a bag of stats.
// The fields below are exactly the contract exported to Unreal: keys and
// values are English identifiers; Spanish display text lives in the catalogs.

export interface Affiliation {
  id: string;
  role: string;
}

export interface EmeraldCharacter {
  id: string;
  name: string;
  nature: string;
  affiliations: Affiliation[];
  paradigm: string;
  knownMaterials: string[];
  alterations: string[];
}

export interface CatalogEntry {
  id: string;
  label: string;
}

export interface Catalogs {
  paradigms: CatalogEntry[];
  materials: CatalogEntry[];
  alterations: CatalogEntry[];
  affiliations: CatalogEntry[];
  roles: CatalogEntry[];
}

export type CatalogName = keyof Catalogs;

export const CATALOG_NAMES: CatalogName[] = [
  'paradigms',
  'materials',
  'alterations',
  'affiliations',
  'roles',
];
