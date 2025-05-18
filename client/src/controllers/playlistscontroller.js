/**
 * @typedef {Object} Playlist
 * @property {string} [_id]
 * @property {string} name
 * @property {string} [description]
 * @property {{ _id: string, name: string }} [genre]
 * @property {Array<{ _id: string, title: string, artist: { _id: string, name: string } }>} [songs]
 * @property {{ _id: string, username: string }} createdBy
 */

/** Fetch all playlists */
export async function fetchPlaylists() {
  const res = await fetch('/api/playlists');
  if (!res.ok) throw new Error('Failed to fetch playlists');
  return res.json();
}

/** Create a new playlist */
export async function createPlaylist(playlist) {
  const res = await fetch('/api/playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playlist),
  });
  if (!res.ok) throw new Error('Failed to create playlist');
  return res.json();
}

/** Update an existing playlist */
export async function updatePlaylist(id, playlist) {
  const res = await fetch(`/api/playlists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(playlist),
  });
  if (!res.ok) {
    alert(
      'Failed to update playlist (permission denied). Status: ' + res.status
    );
  }
  return res.json();
}
export async function addSongToPlaylist(playlistId, songId) {
  const res = await fetch(`/api/playlists/${playlistId}/songs/${songId}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to add song');
  return res.json();
}
/** Delete a playlist */
export async function deletePlaylist(id) {
  const res = await fetch(`/api/playlists/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    alert(
      'Could not delete playlist (permission denied). Status: ' + res.status
    );
  }
}
