// src/api/songsClient.js

/** Hämta alla låtar */
export async function fetchSongs() {
  const res = await fetch('/api/songs');
  if (!res.ok) throw new Error('Failed to fetch songs');
  return res.json();
}

/** Skapa en ny låt */
// För att skapa en låt korrekt måste du skapa artist separat först
export async function uploadSong({ title, artistName, file }) {
  const form = new FormData();
  form.append('title', title);
  form.append('artistName', artistName);
  form.append('track', file);

  const res = await fetch('/api/songs/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function createSong(song) {
  const res = await fetch('/api/songs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(song),
  });
  if (!res.ok) throw new Error('Failed to create song');
  return res.json();
}

/** Ta bort en låt */
export async function deleteSong(id) {
  const res = await fetch(`/api/songs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete song');
}
