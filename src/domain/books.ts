export const GENRES = ['Fiction', 'Non-Fiction', 'Academic', 'Other'] as const;
export const STATUSES = ['To Read', 'Reading', 'Finished'] as const;
export type Genre = typeof GENRES[number];
export type Status = typeof STATUSES[number];
export type BookValues = { title: string; author: string; genre: string; status: string; rating: string; notes: string };
export type Book = Omit<BookValues, 'rating'> & {
  id: string; userId: string; rating: number | null; favorite: boolean; createdAt: unknown;
};
export const emptyBook: BookValues = { title: '', author: '', genre: '', status: '', rating: '', notes: '' };
export type Errors<T> = Partial<Record<keyof T, string>>;

export function validateBook(v: BookValues): Errors<BookValues> {
  const e: Errors<BookValues> = {};
  if (!v.title.trim()) e.title = 'Title is required';
  else if (v.title.length > 100) e.title = 'Title must be at most 100 characters';
  if (!v.author.trim()) e.author = 'Author is required';
  else if (v.author.length > 60) e.author = 'Author must be at most 60 characters';
  if (!GENRES.includes(v.genre as Genre)) e.genre = 'Please choose a genre';
  if (!STATUSES.includes(v.status as Status)) e.status = 'Please choose a status';
  if (v.rating.trim() && (!/^\d+$/.test(v.rating.trim()) || Number(v.rating) > 5)) e.rating = 'Rating must be a whole number from 0 to 5';
  if (v.notes.length > 300) e.notes = 'Notes must be at most 300 characters';
  return e;
}

// Same canonical key is enforced by firestore.rules. Hex is reversible and has no '/' separator.
export function utf8Hex(value: string) {
  return encodeURIComponent(value).replace(/%([0-9a-f]{2})|([^%])/gi, (_match, hex: string | undefined, char: string) => hex ?? char.charCodeAt(0).toString(16).padStart(2, '0')).toLowerCase();
}
export function bookId(uid: string, title: string, author: string) {
  return `${uid}_${utf8Hex(title.trim().toLowerCase())}_${utf8Hex(author.trim().toLowerCase())}`;
}
export type Filters = { genre: string; status: string; favorites: boolean; search: string };
export const emptyFilters: Filters = { genre: 'All', status: 'All', favorites: false, search: '' };
export function shownBooks(books: Book[], filters: Filters) {
  const search = filters.search.trim().toLowerCase();
  const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
  return books.filter(b => (filters.genre === 'All' || b.genre === filters.genre)
    && (filters.status === 'All' || b.status === filters.status)
    && (!filters.favorites || b.favorite)
    && (!search || b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search)))
    .sort((a, b) => compare(a.title.toLowerCase(), b.title.toLowerCase()) || compare(a.author.toLowerCase(), b.author.toLowerCase()));
}
export function summarize(books: Book[]) {
  return {
    count: books.length,
    favorites: books.filter(b => b.favorite).length,
    statuses: STATUSES.map((status, order) => ({ status, order, count: books.filter(b => b.status === status).length }))
      .filter(row => row.count > 0).sort((a, b) => b.count - a.count || a.order - b.order),
  };
}
