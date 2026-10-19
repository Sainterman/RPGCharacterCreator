import type { Catalogs, EmeraldCharacter } from './types';

const API = '/api/emerald';

export class ApiError extends Error {
  details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.details = details;
  }
}

const request = async <T>(path: string, method = 'GET', body?: unknown): Promise<T> => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? `Error ${res.status}`, data.details ?? []);
  return data as T;
};

export const fetchCatalogs = () => request<Catalogs>('/catalogs');
export const saveCatalogs = (catalogs: Catalogs) => request<Catalogs>('/catalogs', 'PUT', catalogs);

export const fetchCharacters = () => request<EmeraldCharacter[]>('/characters');
export const createCharacter = (c: EmeraldCharacter) =>
  request<EmeraldCharacter>('/characters', 'POST', c);
export const updateCharacter = (c: EmeraldCharacter) =>
  request<EmeraldCharacter>(`/characters/${encodeURIComponent(c.id)}`, 'PUT', c);
export const deleteCharacter = (id: string) =>
  request<{ id: string }>(`/characters/${encodeURIComponent(id)}`, 'DELETE');

export const exportForUnreal = () =>
  request<{ file: string; rows: EmeraldCharacter[] }>('/export', 'POST');
