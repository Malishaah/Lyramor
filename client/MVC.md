## Arkitektur (MVC)

Projektet följer **Model–View–Controller**-mönstret:

### Model
- Filer: `src/model/*.js`  
- Ansvar: Endast data- och affärslogik.  
  - `PlaylistModel.js` hanterar CRUD (create, read, update, delete) och sparar mot LocalStorage.  
  - Event­hantering via callbacken `onChange`.

### View
- Filer: `src/view/*.js` + `index.html` + `style.css`  
- Ansvar: Endast rendering av HTML/CSS och insamling av användar­­input.  
  - `PlaylistView.js` renderar formulär och spelliste­kort, grupperade per genre → artist.  
  - `bindAddPlaylist()` exponerar ett enkelt API för Controller att koppla event.

### Controller
- Filer: `src/controller/*.js` + `app.js`  
- Ansvar: Koordinering mellan Model och View, hantering av användar­interaktioner.  
  - `PlaylistController.js` sätter `model.onChange` → `view.render()`, binder `view.bindAddPlaylist()` till sin `handleAddPlaylist()` och initierar appen i `app.js`.

Med denna separation säkerställer vi en tydlig ansvarsfördelning:
- **Model** vet inget om DOM eller events,  
- **View** vet bara hur data ska presenteras och hur input samlas in,  
- **Controller** vet hur och när data ska uppdateras och när vyn ska åter­renderas.
