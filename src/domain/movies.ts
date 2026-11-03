export const GENRES = ['Action', 'Comedy', 'Drama', 'Horror'] as const;
export const STATUSES = ['Plan to Watch', 'Watching', 'Watched'] as const;
export type Genre = typeof GENRES[number];
export type WatchStatus = typeof STATUSES[number];
export type Movie = {
  id: string; userId: string; title: string; director: string; genre: Genre;
  status: WatchStatus; rating?: number; notes?: string; favorite: boolean; createdAt: unknown;
};
export type MovieValues = { title: string; director: string; genre: string; status: string; rating: string; notes: string };
export const emptyMovie = (): MovieValues => ({ title: '', director: '', genre: '', status: '', rating: '', notes: '' });
export const movieValues = (m: Movie): MovieValues => ({ title: m.title, director: m.director, genre: m.genre, status: m.status, rating: m.rating === undefined ? '' : String(m.rating), notes: m.notes ?? '' });
export function validateMovie(v: MovieValues) {
  const e: Partial<Record<keyof MovieValues, string>> = {};
  if (!v.title.trim()) e.title = 'Title is required';
  else if (v.title.length > 100) e.title = 'Title must be at most 100 characters';
  if (!v.director.trim()) e.director = 'Director is required';
  else if (v.director.length > 60) e.director = 'Director must be at most 60 characters';
  if (!(GENRES as readonly string[]).includes(v.genre)) e.genre = 'Please choose a genre';
  if (!(STATUSES as readonly string[]).includes(v.status)) e.status = 'Please choose a status';
  if (v.rating.trim() && (!/^\d+$/.test(v.rating.trim()) || Number(v.rating) > 5)) e.rating = 'Rating must be a whole number from 0 to 5';
  if (v.notes.length > 300) e.notes = 'Notes must be at most 300 characters';
  return e;
}
// encodeURIComponent is available in Hermes and needs no Node/TextEncoder polyfill.
function utf8Hex(value: string) {
  return encodeURIComponent(value).replace(/%([0-9A-F]{2})|([^%])/g,
    (_match, hex: string | undefined, char: string | undefined) => hex ? hex.toLowerCase() : char!.charCodeAt(0).toString(16).padStart(2, '0'));
}
export const movieId = (uid: string, title: string, director: string) => `${uid}_${utf8Hex(title.trim().toLowerCase())}_${utf8Hex(director.trim().toLowerCase())}`;
export type MovieFilters = { genre: string; status: string; favorites: boolean; search: string };
export const emptyFilters = (): MovieFilters => ({ genre: 'All', status: 'All', favorites: false, search: '' });
export function visibleMovies(movies: Movie[], filters: MovieFilters) {
  const term = filters.search.trim().toLowerCase();
  return movies.filter(m => (filters.genre === 'All' || m.genre === filters.genre)
    && (filters.status === 'All' || m.status === filters.status) && (!filters.favorites || m.favorite)
    && (!term || m.title.toLowerCase().includes(term) || m.director.toLowerCase().includes(term)))
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()) || a.director.toLowerCase().localeCompare(b.director.toLowerCase()));
}
export function movieSummary(movies: Movie[]) {
  return { count: movies.length, favorites: movies.filter(m => m.favorite).length,
    statuses: STATUSES.map(status => ({ status, count: movies.filter(m => m.status === status).length }))
      .filter(row => row.count > 0).sort((a, b) => b.count - a.count || STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status)) };
}
