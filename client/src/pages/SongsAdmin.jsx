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
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSong(id);
      setSongs((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <>
      <Header />
      <div className='max-w-3xl mx-auto p-6 bg-[#EFE8FF] dark:bg-gray-900 min-h-screen'>
        <h2 className='text-xl font-bold mb-4 dark:text-white'>Manage Songs</h2>

        <form onSubmit={handleSubmit} className='mb-6 space-y-4'>
          <div>
            <label className='block mb-1'>Title</label>
            <input
              name='title'
              value={form.title}
              onChange={handleChange}
              className='w-full border p-2 rounded'
              required
            />
          </div>
          <div>
            <label className='block mb-1'>Artist Name</label>
            <input
              name='artistName'
              value={form.artistName}
              onChange={handleChange}
              className='w-full border p-2 rounded'
              required
            />
          </div>
          <div>
            <label className='block mb-1'>Genre</label>
            <select
              name='genrename'
              value={form.genrename}
              onChange={handleChange}
              className='w-full border p-2 rounded'
              required>
              <option value=''>Select genre…</option>
              {genres.map((g) => (
                <option key={g._id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block mb-1'>Sound File</label>
            <input
              type='file'
              accept='audio/*'
              onChange={(e) => setFile(e.target.files[0])}
              className='w-full'
              required
            />
          </div>
          <button
            type='submit'
            className='bg-green-500 text-white px-4 py-2 rounded'
            disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload Song'}
          </button>
        </form>

        {loading ? (
          <p className='dark:text-white'>Loading songs…</p>
        ) : (
          <ul className='space-y-3'>
            {songs.map((s) => (
              <li
                key={s._id}
                className='bg-white dark:bg-gray-800 p-3 rounded shadow flex flex-col gap-2'>
                <span className='dark:text-white'>
                  🎵 {s.title} — {s.artist?.name || 'Unknown'}
                </span>
                {s.trackUrl && (
                  <audio controls className='w-full'>
                    <source src={s.trackUrl} type='audio/mpeg' />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <button
                  onClick={() => handleDelete(s._id)}
                  className='bg-red-400 text-white px-2 py-1 rounded self-end'>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
