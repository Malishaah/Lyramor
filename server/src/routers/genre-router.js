const express = require('express');
const { Genre } = require('../models/playlist'); // eller var dina modeller finns

const router = express.Router();

// GET /api/genres
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/genres
router.post('/', async (req, res) => {
  try {
    const genre = new Genre({ name: req.body.name });
    const saved = await genre.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/genres/:id
router.delete('/:id', async (req, res) => {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
