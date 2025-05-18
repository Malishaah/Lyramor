export default class PlaylistModel {
  constructor(rootEl) {
    this.root = rootEl;
    this.form = this.root.querySelector('#playlist-form');
    this.listContainer = this.root.querySelector('#playlist-list');
  }

  bindAddPlaylist(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = this.form.name.value.trim();
      const genre = this.form.genre.value.trim();
      const artist = this.form.artist.value.trim();
      const tracks = this.form.tracks.value
        .split('\n') // dela på radslut
        .map((t) => t.trim()) // ta bort whitespace
        .filter((t) => t); // filtrera bort tomma rader

      handler({ name, genre, artist, tracks });
      this.form.reset();
    });
  }

  render(playlists) {
    this.listContainer.innerHTML = '';

    if (playlists.length === 0) {
      this.listContainer.textContent = 'Inga spellistor skapade än.';
      return;
    }

    const grouped = {};
    playlists.forEach((pl) => {
      if (!grouped[pl.genre]) grouped[pl.genre] = {};
      if (!grouped[pl.genre][pl.artist]) grouped[pl.genre][pl.artist] = [];
      grouped[pl.genre][pl.artist].push(pl);
    });

    for (const [genre, artists] of Object.entries(grouped)) {
      const genreSection = document.createElement('section');
      genreSection.innerHTML = `<h2>${genre}</h2>`;
      for (const [artist, pls] of Object.entries(artists)) {
        const artistSection = document.createElement('div');
        artistSection.innerHTML = `<h3>${artist}</h3>`;
        pls.forEach((pl) => {
          const card = document.createElement('div');
          card.className = 'playlist-card';
          card.innerHTML = `
              <h4>${pl.name}</h4>
              <ul>
                ${pl.tracks.map((track) => `<li>${track}</li>`).join('')}
              </ul>
            `;
          artistSection.appendChild(card);
        });
        genreSection.appendChild(artistSection);
      }
      this.listContainer.appendChild(genreSection);
    }
  }
}
