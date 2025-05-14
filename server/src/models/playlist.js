const mongoose = require('mongoose');
const { Schema } = mongoose;

// Genre
const genreSchema = new Schema({
  name: { type: String, required: true, unique: true },
});

// Artist
const artistSchema = new Schema({
  name: { type: String, required: true },
});

// Song
const songSchema = new Schema({
  title: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
  duration: { type: Number },
  trackUrl: { type: String },
  genre: { type: Schema.Types.ObjectId, ref: 'Genre', required: true },
});

// Playlist
const playlistSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    genre: { type: Schema.Types.ObjectId, ref: 'Genre' },
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Genre = mongoose.model('Genre', genreSchema);
const Artist = mongoose.model('Artist', artistSchema);
const Song = mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = { Genre, Artist, Song, Playlist };
