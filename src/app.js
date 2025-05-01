import PlaylistModel from './src/model/PlaylistModel.js';
import PlaylistView from './src/view/PlaylistView.js';
import PlaylistController from './src/controller/PlaylistController.js';

document.addEventListener('DOMContentLoaded', () => {

  const model = new PlaylistModel();

  const rootEl = document.getElementById('app');

  const view = new PlaylistView(rootEl);

  const controller = new PlaylistController(model, view);


  controller.init();
});
