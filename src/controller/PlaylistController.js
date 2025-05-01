export default class PlaylistController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
  
      this.model.onChange = playlists => this.view.render(playlists);
  
      this.view.bindAddPlaylist(this.handleAddPlaylist.bind(this));
    }
  
    init() {
      this.view.render(this.model.getAll());
    }
  
    handleAddPlaylist(playlistData) {
      this.model.create(playlistData);
    }
  }
  