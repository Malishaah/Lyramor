// src/routers/playlist-router.js
const express = require('express');
const mongoose = require('mongoose');
const { Genre, Artist, Song, Playlist } = require('../models/playlist'); // anta att du exporterar Genre, Artist, Song, Playlist här

const playlistRouter = express.Router();

// Hjälpfunktion för att kolla giltiga ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE en ny spellista
playlistRouter.post('/', async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json('Unauthorized');
    }

    const { name, description, genre, songs } = req.body;
    const errors = [];

    if (!name || typeof name !== 'string') errors.push('name');
    if (genre && !isValidObjectId(genre)) errors.push('genre');
    if (songs && !Array.isArray(songs)) {
      errors.push('songs must be an array of IDs');
    } else if (songs) {
      // Kontrollera varje song-id
      for (const s of songs) {
        if (!isValidObjectId(s)) {
          errors.push(`invalid song ID: ${s}`);
        }
      }
    }

    if (errors.length) {
      return res
        .status(400)
        .json(`Invalid or missing fields: ${errors.join(', ')}`);
    }

    // Optional: kontrollera att genre finns
    if (genre) {
      const g = await Genre.findById(genre);
      if (!g) return res.status(404).json(`Genre ${genre} not found`);
    }

    // Optional: kontrollera att låtar finns
    if (songs) {
      const found = await Song.find({ _id: { $in: songs } }).select('_id');
      if (found.length !== songs.length) {
        return res.status(404).json('One or more songs not found');
      }
    }

    const playlist = new Playlist({
      name,
      description,
      genre,
      songs,
      createdBy: req.session.user._id,
    });

    const saved = await playlist.save();
    // Populera för respons
    const populated = await Playlist.findById(saved._id)
      .populate('createdBy', 'username')
      .populate('genre', 'name')
      .populate({
        path: 'songs',
        select: 'title artist',
        populate: { path: 'artist', select: 'name' },
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// READ alla spellistor
playlistRouter.get('/', async (_req, res) => {
  try {
    const lists = await Playlist.find()
      .populate('createdBy', 'username')
      .populate('genre', 'name')
      .populate({
        path: 'songs',
        select: 'title artist',
        populate: { path: 'artist', select: 'name' },
      });
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ en spellista per ID
playlistRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json(`${id} not found`);
    }
    const list = await Playlist.findById(id)
      .populate('createdBy', 'username')
      .populate('genre', 'name')
      .populate({
        path: 'songs',
        select: 'title artist',
        populate: { path: 'artist', select: 'name' },
      });
    if (!list) {
      return res.status(404).json(`${id} not found`);
    }
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE en spellista per ID
playlistRouter.put('/:id', async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json('Unauthorized');
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json(`${id} not found`);
    }
    const list = await Playlist.findById(id);
    if (!list) {
      return res.status(404).json(`${id} not found`);
    }

    // Endast admin eller grundaren kan uppdatera
    if (
      !req.session.user.isAdmin &&
      list.createdBy.toString() !== req.session.user._id
    ) {
      return res.status(403).json('Forbidden');
    }

    const { name, description, genre, songs } = req.body;
    const errors = [];
    if (name !== undefined && typeof name !== 'string') errors.push('name');
    if (genre !== undefined && !isValidObjectId(genre)) errors.push('genre');
    if (songs !== undefined && !Array.isArray(songs)) {
      errors.push('songs must be an array of IDs');
    }

    if (errors.length) {
      return res
        .status(400)
        .json(`Invalid or missing fields: ${errors.join(', ')}`);
    }

    // Uppdatera fält
    if (name !== undefined) list.name = name;
    if (description !== undefined) list.description = description;
    if (genre !== undefined) list.genre = genre;
    if (songs !== undefined) list.songs = songs;

    const updated = await list.save();
    const populated = await Playlist.findById(updated._id)
      .populate('createdBy', 'username')
      .populate('genre', 'name')
      .populate({
        path: 'songs',
        select: 'title artist',
        populate: { path: 'artist', select: 'name' },
      });

    res.status(200).json(populated);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// DELETE en spellista per ID
playlistRouter.delete('/:id', async (req, res) => {
  try {
    if (!req.session?.user) {
      return res.status(401).json('Unauthorized');
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json(`${id} not found`);
    }
    const list = await Playlist.findById(id);
    if (!list) {
      return res.status(404).json(`${id} not found`);
    }

    // Endast admin eller grundaren kan ta bort
    if (
      !req.session.user.isAdmin &&
      list.createdBy.toString() !== req.session.user._id
    ) {
      return res.status(403).json('Forbidden');
    }

    await Playlist.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
playlistRouter.post('/:id/songs/:songId', async (req, res) => {
  const { id, songId } = req.params;
  if (!isValidObjectId(id) || !isValidObjectId(songId))
    return res.status(400).json('Invalid ID');

  const playlist = await Playlist.findById(id);
  if (!playlist) return res.status(404).json('Playlist not found');

  // (validera behörighet om du vill)
  if (!playlist.songs.includes(songId)) {
    playlist.songs.push(songId);
    await playlist.save();
  }

  const populated = await Playlist.findById(id)
    .populate({
      path: 'songs',
      select: 'title artist',
      populate: { path: 'artist', select: 'name' }
    });
  res.json(populated);
});
module.exports = playlistRouter;
