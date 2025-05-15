// src/components/SongsAdmin.jsx
import { useState, useEffect } from 'react';
import { fetchSongs, deleteSong, uploadSong } from '../api/songsClient';
import { fetchGenres } from '../api/genresClient';
import Header from '../components/Header';

export default function SongsAdmin() {
  const [songs, setSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({
    title: '',
    artistName: '',
    genrename: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [songsData, genresData] = await Promise.all([
          fetchSongs(),
          fetchGenres(),
        ]);
        setSongs(songsData);
        setGenres(genresData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Kunde inte ladda data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('artistName', form.artistName);
      formData.append('genrename', form.genrename);
      formData.append('track', file);

      const newSong = await uploadSong(formData);
      setSongs((prev) => [...prev, newSong]);
      setForm({ title: '', artistName: '', genrename: '' });
      setFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Kunde inte ladda upp låten.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Kunde inte ta bort låten.');
    }
  };

  return (
    <div className="bg-[#FEF1DC] min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">

        <h2 className="text-2xl font-bold mb-6 text-center">Manage Songs</h2>

        {error && (
          <div className="w-full bg-red-200 text-red-800 p-4 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="w-full mb-8 space-y-4 flex flex-col items-center"
        >
          <div className="w-full">
            <label className="block mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="w-full">
            <label className="block mb-1">Artist Name</label>
            <input
              name="artistName"
              value={form.artistName}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="w-full">
            <label className="block mb-1">Genre</label>
            <select
              name="genrename"
              value={form.genrename}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select genre…</option>
              {genres.map((g) => (
                <option key={g._id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="block mb-1">Sound File</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transform transition-transform duration-150 hover:scale-110"
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload Song'}
          </button>
        </form>

        {loading ? (
          <p>Loading songs…</p>
        ) : (
          <ul className="w-full space-y-4">
            {songs.map((s) => (
              <li
                key={s._id}
                className="bg-white p-4 rounded shadow flex flex-col gap-4 items-center"
              >
                <span>🎵 {s.title} — {s.artist?.name || 'Unknown'}</span>
                {s.trackUrl && (
                  <audio controls className="w-full">
                    <source src={s.trackUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <button
                  onClick={() => handleDelete(s._id)}
                  className="bg-[#D3504A] text-white px-10 py-2 rounded shadow hover:bg-[#EA726D] transform transition-transform duration-150 hover:scale-110"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
