const STORAGE_KEY = 'lyramor_playlists';

export default class PlaylistModel {
  constructor() {

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    this.playlists = Array.isArray(saved) ? saved : [];
  }


  getAll() {
    return this.playlists;
  }

  create({ name, genre, artist, tracks }) {
    const newPl = {
      id: Date.now().toString(),
      name,
      genre,
      artist,
      tracks,     
      createdAt: new Date().toISOString()
    };
    this.playlists.push(newPl);
    this._commit();
    return newPl;
  }

  remove(id) {
    this.playlists = this.playlists.filter(pl => pl.id !== id);
    this._commit();
  }

  update(id, updatedFields) {
    this.playlists = this.playlists.map(pl =>
      pl.id === id ? { ...pl, ...updatedFields } : pl
    );
    this._commit();
  }

  _commit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.playlists));

    if (this.onChange) this.onChange(this.playlists);
  }
}
