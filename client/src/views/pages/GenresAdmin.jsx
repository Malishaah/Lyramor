// src/components/GenresAdmin.jsx
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import {
  fetchGenres,
  createGenre,
  deleteGenre,
} from '../../controllers/genrescontroller';

export default function GenresAdmin() {
  const [genres, setGenres] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchGenres();
        setGenres(data);
      } catch (err) {
        console.error(err);
        setError('Kunde inte hämta genrer.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setError(null);
    try {
      const created = await createGenre({ name: newName.trim() });
      setGenres((prev) => [...prev, created]);
      setNewName('');
    } catch (err) {
      console.error(err);
      setError('Kunde inte skapa genre.');
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await deleteGenre(id);
      setGenres((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      console.error(err);
      setError('Kunde inte ta bort genre.');
    }
  };

  return (
    <div className='bg-[#FEF1DC] min-h-screen'>
      <Header />
      <div className='max-w-4xl mx-auto px-4 py-8 flex flex-col items-center'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Manage Genres</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className='w-full flex flex-col sm:flex-row items-center gap-4 mb-6'>
          <input
            className='flex-grow p-2 border rounded w-full sm:w-auto'
            placeholder='New genre name'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type='submit'
            className='bg-green-500 hover:bg-green-600 text-white px-10 py-2 rounded transform transition-transform duration-150 hover:scale-110'>
            Add
          </button>
        </form>

        {error && (
          <div className='w-full bg-red-200 text-red-800 p-4 rounded mb-6 text-center'>
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading genres…</p>
        ) : genres.length > 0 ? (
          <ul className='w-full space-y-4'>
            {genres.map((g) => (
              <li
                key={g._id}
                className='bg-white p-4 rounded shadow flex justify-between items-center'>
                <span>{g.name}</span>
                <button
                  onClick={() => handleDelete(g._id)}
                  className='bg-[#D3504A] text-white px-10 py-1 rounded shadow hover:bg-[#EA726D] transform transition-transform duration-150 hover:scale-110'>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No genres found.</p>
        )}
      </div>
    </div>
  );
}
