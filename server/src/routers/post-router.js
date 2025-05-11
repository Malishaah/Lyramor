// src/routers/post-router.js
const express = require('express');
const mongoose = require('mongoose');
const { PostModel } = require('../models/post-model');

const postRouter = express.Router();

// Helper to validate ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// CREATE a new post
postRouter.post('/', async (req, res) => {
  try {
    const { title, content, imgUrl } = req.body;
    if (!req.session?.user) {
      return res.status(401).json('Unauthorized');
    }

    // Basic validation
    const errors = [];
    if (!title || typeof title !== 'string') errors.push('title');
    if (!content || typeof content !== 'string') errors.push('content');
    if (errors.length) {
      return res
        .status(400)
        .json(`Invalid or missing fields: ${errors.join(', ')}`);
    }

    const authorId = req.session.user._id;
    const post = new PostModel({ title, content, imgUrl, author: authorId });
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// READ all posts
postRouter.get('/', async (_req, res) => {
  try {
    const posts = await PostModel.find().populate('author', 'username');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ one post by ID
postRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(404).json(`${id} not found`);
    }
    const post = await PostModel.findById(id).populate('author', 'username');
    if (!post) {
      return res.status(404).json(`${id} not found`);
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a post by ID
postRouter.put('/:id', async (req, res) => {
  try {
    const { title, content, imgUrl } = req.body;
    const { id } = req.params;
    if (!req.session?.user) {
      return res.status(401).json('Unauthorized');
    }

    if (!isValidObjectId(id)) {
      return res.status(404).json(`${id} not found`);
    }
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json(`${id} not found`);
    }

    // Only admin or owner can update
    if (
      !req.session.user.isAdmin &&
      post.author.toString() !== req.session.user._id
    ) {
      return res.status(403).json('Forbidden');
    }

    // Field validation
    const errors = [];
    if (typeof title !== 'string') errors.push('title');
    if (typeof content !== 'string') errors.push('content');
    if (errors.length) {
      return res
        .status(400)
        .json(`Invalid or missing fields: ${errors.join(', ')}`);
    }

    const updated = await PostModel.findByIdAndUpdate(
      id,
      { title, content, imgUrl },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(400).json(error.message);
  }
});

// DELETE a post by ID
postRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.session?.user) {
      return res.status(401).json('Unauthorized');
    }

    if (!isValidObjectId(id)) {
      return res.status(404).json(`${id} not found`);
    }
    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json(`${id} not found`);
    }

    // Only admin or owner can delete
    if (
      !req.session.user.isAdmin &&
      post.author.toString() !== req.session.user._id
    ) {
      return res.status(403).json('Forbidden');
    }

    await PostModel.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = postRouter;
