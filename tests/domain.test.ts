import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookId, emptyBook, emptyFilters, shownBooks, summarize, utf8Hex, validateBook } from '../src/domain/books.ts';
import type { Book } from '../src/domain/books.ts';
import { validateAuth } from '../src/domain/auth.ts';

test('canonical keys handle case, whitespace, separators and Unicode without collisions', () => {
  assert.equal(bookId('alice', ' Dune ', 'Frank Herbert'), bookId('alice', 'dune', 'frank herbert'));
  assert.notEqual(bookId('alice', 'a_b', 'c'), bookId('alice', 'a', 'b_c'));
  assert.notEqual(bookId('alice', 'a', 'b'), bookId('bob', 'a', 'b'));
  assert.equal(utf8Hex('Đọc sách / 📚'), Buffer.from('Đọc sách / 📚').toString('hex'));
});
test('book validation exact required, boundaries, optional rating', () => {
  assert.deepEqual(validateBook(emptyBook), { title: 'Title is required', author: 'Author is required', genre: 'Please choose a genre', status: 'Please choose a status' });
  const valid = { ...emptyBook, title: 'a'.repeat(100), author: 'b'.repeat(60), genre: 'Fiction', status: 'Reading', notes: 'n'.repeat(300) };
  assert.deepEqual(validateBook(valid), {});
  for (const rating of ['0', '5', '']) assert.equal(validateBook({ ...valid, rating }).rating, undefined);
  for (const rating of ['-1', '6', '1.5', 'NaN', '1e0']) assert.equal(validateBook({ ...valid, rating }).rating, 'Rating must be a whole number from 0 to 5');
  assert.equal(Object.keys(validateBook({ ...valid, title: 'a'.repeat(101), author: 'b'.repeat(61), notes: 'n'.repeat(301) })).length, 3);
});
test('auth errors disappear once the input is valid', () => {
  assert.equal(validateAuth({ email: '', password: '', confirm: '' }, true).confirm, 'Confirm password is required');
  assert.equal(validateAuth({ email: 'reader@example.com', password: '123', confirm: '123' }, true).password, 'Password must be at least 6 characters');
  assert.deepEqual(validateAuth({ email: 'reader@example.com', password: '123456', confirm: '123456' }, true), {});
  assert.deepEqual(validateAuth({ email: 'reader@example.com', password: '123', confirm: '' }, false), {});
});
test('combined filters, title-author sorting and summary use exactly the visible books', () => {
  const books = [
    { id: '1', title: 'Dune', author: 'Zed', genre: 'Fiction', status: 'Reading', favorite: true },
    { id: '2', title: 'dune', author: 'Amy', genre: 'Fiction', status: 'To Read', favorite: true },
    { id: '3', title: 'Algorithms', author: 'Author', genre: 'Academic', status: 'Finished', favorite: false },
  ] as Book[];
  assert.deepEqual(shownBooks(books, emptyFilters).map(b => b.id), ['3', '2', '1']);
  const visible = shownBooks(books, { genre: 'Fiction', status: 'All', favorites: true, search: ' DUNE ' });
  assert.equal(visible.length, 2);
  assert.deepEqual(summarize(visible).statuses.map(s => s.status), ['To Read', 'Reading']);
  assert.equal(summarize(visible).favorites, 2);
  assert.equal(shownBooks(books, { genre: 'Fiction', status: 'Reading', favorites: true, search: 'zed' }).length, 1);
  assert.equal(shownBooks(books.map(b => ({ ...b, favorite: false })), { ...emptyFilters, favorites: true }).length, 0);
});
