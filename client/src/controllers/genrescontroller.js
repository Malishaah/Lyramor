// src/api/genresClient.js

/** Hämta alla genres */
export async function fetchGenres() {
  const res = await fetch('/api/genres');
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

/** Skapa ny genre */
export async function createGenre(genre) {
  const res = await fetch('/api/genres', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(genre),
  });
  if (!res.ok) throw new Error('Failed to create genre');
  return res.json();
}

/** Ta bort en genre */
export async function deleteGenre(id) {
  const res = await fetch(`/api/genres/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete genre');
}
