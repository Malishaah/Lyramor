export default class PlaylistView {
    constructor(rootEl) {
      this.root = rootEl;
  

      this.root.innerHTML = `
        <form id="playlist-form">
          <input name="name" placeholder="Spellistans namn" required />
          <input name="genre" placeholder="Genre" required />
          <input name="artist" placeholder="Artist" required />
          <button type="submit">Skapa spellista</button>
        </form>
        <div id="playlist-list"></div>
      `;
  
      // Håll kvar referenser till form och lista
      this.form = this.root.querySelector('#playlist-form');
      this.listContainer = this.root.querySelector('#playlist-list');
    }
  
    // Controller kallar bindAddPlaylist för att registrera hanteraren
    bindAddPlaylist(handler) {
      this.form.addEventListener('submit', e => {
        e.preventDefault();
        const data = {
          name: this.form.name.value.trim(),
          genre: this.form.genre.value.trim(),
          artist: this.form.artist.value.trim(),

          tracks: []
        };
        handler(data);
        this.form.reset();
      });
    }

    render(playlists) {
      this.listContainer.innerHTML = '';
  
      if (playlists.length === 0) {
        this.listContainer.textContent = 'Inga spellistor ännu.';
        return;
      }
  
      playlists.forEach(pl => {
        const div = document.createElement('div');
        div.className = 'playlist';
        div.innerHTML = `
          <h3>${pl.name}</h3>
          <p><strong>Genre:</strong> ${pl.genre}</p>
          <p><strong>Artist:</strong> ${pl.artist}</p>
        `;
        this.listContainer.appendChild(div);
      });
    }
  }
  