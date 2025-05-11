export default class Track {
    constructor({ title, duration }) {
      this.id = Date.now().toString();
      this.title = title;
      this.duration = duration; // t.ex. "3:45"
    }
  }
  
  export default class Artist {
    constructor(name) {
      this.id = Date.now().toString();
      this.name = name;
    }
  }
  