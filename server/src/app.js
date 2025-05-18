// src/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { authRouter } = require('./routers/Auth-routers');
const playlistsRoutes = require('./routers/playlistRouter');
const genreRouter = require('./routers/genre-router');
const songRouter = require('./routers/song-router');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

app.use(
  session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'en_hemlig_sträng',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set to true in production when using HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Mount routers
app.use('/api/users', authRouter);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/genres', genreRouter);
app.use('/api/songs', songRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = { app };
