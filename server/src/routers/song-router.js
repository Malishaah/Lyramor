const express = require('express');
const { Song, Artist, Genre } = require('../models/playlist'); // eller '../models/song' om du har det separat
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/songs/upload
router.post('/upload', upload.single('track'), async (req, res) => {
  try {
    const { title, artistName, genrename } = req.body;
    const filePath = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.filename
    }`;

    // Hitta eller skapa artist
    let artist = await Artist.findOne({ name: artistName });
    if (!artist) {
      try {
        artist = await Artist.create({ name: artistName });
      } catch (error) {
        return res.status(400).json({ error: 'Invalid artist data' });
      }
    }

    let genre = await Genre.findOne({ name: genrename });
    if (!genre) {
      genre = await Genre.create({ name: genrename });
    }

    const song = new Song({
      title,
      artist: artist._id,
      trackUrl: filePath,
      genre: genre._id,
    });

    const saved = await song.save();
    const populated = await Song.findById(saved._id).populate('artist', 'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// CREATE song
// POST /api/songs
router.post('/', async (req, res) => {
  try {
    const { title, artist } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json('Invalid or missing title');
    }

    let artistId;

    if (typeof artist === 'string') {
      artistId = artist;
    } else if (artist && typeof artist === 'object' && artist.name) {
      // Skapa ny artist om namn skickas som objekt
      const createdArtist = await Artist.create({
        name: artist.name,
        genre: artist.genre, // här behövs en ObjectId till en genre
      });
      artistId = createdArtist._id;
    } else {
      return res.status(400).json('Invalid or missing artist');
    }

    const newSong = await Song.create({ title, artist: artistId });

    const populated = await Song.findById(newSong._id).populate(
      'artist',
      'name'
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });

    // ta bort filen från uploads-mappen om den finns
    if (song.trackUrl) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '..', song.trackUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// READ songs
router.get('/', async (_req, res) => {
  try {
    const songs = await Song.find().populate('artist', 'name');
    res.json(songs);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
