import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyMovie, emptyFilters, movieId, movieSummary, validateMovie, visibleMovies, type Movie } from '../src/domain/movies.ts';

const values = { title: 'Dune', director: 'Denis Villeneuve', genre: 'Drama', status: 'Watched', rating: '', notes: '' };
test('empty movie has the four exact required errors and optional rating is omitted', () => {
  assert.deepEqual(validateMovie(emptyMovie()), { title: 'Title is required', director: 'Director is required', genre: 'Please choose a genre', status: 'Please choose a status' });
  assert.deepEqual(validateMovie(values), {});
});
test('movie validation enforces all field boundaries', () => {
  assert.equal(validateMovie({ ...values, title: '   ' }).title, 'Title is required');
  assert.equal(validateMovie({ ...values, title: 'a'.repeat(101) }).title, 'Title must be at most 100 characters');
  assert.equal(validateMovie({ ...values, director: '   ' }).director, 'Director is required');
  assert.equal(validateMovie({ ...values, director: 'a'.repeat(61) }).director, 'Director must be at most 60 characters');
  for (const rating of ['-1', '6', '1.5', 'hello', 'Infinity']) assert.equal(validateMovie({ ...values, rating }).rating, 'Rating must be a whole number from 0 to 5');
  for (const rating of ['0', '5', ' 3 ', '']) assert.equal(validateMovie({ ...values, rating }).rating, undefined);
  assert.equal(validateMovie({ ...values, notes: 'a'.repeat(301) }).notes, 'Notes must be at most 300 characters');
  assert.deepEqual(validateMovie({ ...values, title: 'a'.repeat(100), director: 'a'.repeat(60), notes: 'a'.repeat(300) }), {});
});
test('canonical id ignores case and outer spaces but separates users and delimiters', () => {
  assert.equal(movieId('a', ' DUNE ', 'Denis'), movieId('a', 'dune', 'denis'));
  assert.notEqual(movieId('a', 'dune', 'denis'), movieId('b', 'dune', 'denis'));
  assert.notEqual(movieId('a', 'a_b', 'c'), movieId('a', 'a', 'b_c'));
  assert.equal(movieId('a', 'Điện ảnh', 'Lê'), `a_${Buffer.from('điện ảnh').toString('hex')}_${Buffer.from('lê').toString('hex')}`);
});
const make = (title: string, director: string, genre: Movie['genre'], status: Movie['status'], favorite: boolean): Movie => ({ id: title + director, userId: 'a', title, director, genre, status, favorite, createdAt: null });
const movies = [make('Dune', 'Zed', 'Drama', 'Watched', true), make('alien', 'Ridley Scott', 'Horror', 'Plan to Watch', false), make('dune', 'Amy', 'Drama', 'Watching', false), make('Arrival', 'Denis', 'Drama', 'Plan to Watch', true), make('Airplane', 'Jim', 'Comedy', 'Watching', true)];
test('sort is case insensitive and uses director as the tie breaker', () => {
  assert.deepEqual(visibleMovies(movies, emptyFilters()).map(m => m.title + '/' + m.director), ['Airplane/Jim', 'alien/Ridley Scott', 'Arrival/Denis', 'dune/Amy', 'Dune/Zed']);
});
test('all filters combine and immediately reflect favorite changes', () => {
  const filters = { genre: 'Drama', status: 'Plan to Watch', favorites: true, search: ' DENIS ' };
  assert.deepEqual(visibleMovies(movies, filters).map(m => m.title), ['Arrival']);
  assert.equal(visibleMovies(movies.map(m => ({ ...m, favorite: false })), filters).length, 0);
  assert.equal(visibleMovies(movies, emptyFilters()).length, 5);
});
test('summary uses the visible subset, nonzero rows and prescribed tie order', () => {
  assert.deepEqual(movieSummary(movies), { count: 5, favorites: 3, statuses: [{ status: 'Plan to Watch', count: 2 }, { status: 'Watching', count: 2 }, { status: 'Watched', count: 1 }] });
  assert.deepEqual(movieSummary(visibleMovies(movies, { ...emptyFilters(), search: 'zed' })), { count: 1, favorites: 1, statuses: [{ status: 'Watched', count: 1 }] });
  assert.deepEqual(movieSummary([]), { count: 0, favorites: 0, statuses: [] });
});
