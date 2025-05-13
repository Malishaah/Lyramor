import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { fetchGenres, createGenre, deleteGenre } from '../api/genresClient';
export default function GenresAdmin() {
  const [genres, setGenres] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGenres()
      .then(setGenres)
      .catch((err) => {
        console.error(err);
        setError('Failed to load genres');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const created = await createGenre({ name: newName.trim() });
      setGenres((prev) => [...prev, created]);
      setNewName('');
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to create genre');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGenre(id);
      setGenres((prev) => prev.filter((g) => g._id !== id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete genre');
    }
  };

  return (
    <>
      <Header />
      <div className='max-w-xl mx-auto p-6 bg-[#EFE8FF] dark:bg-gray-900 min-h-screen'>
        <h2 className='text-xl font-bold mb-4 dark:text-white'>
          Manage Genres
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className='mb-6 flex gap-2'>
          <input
            className='flex-grow p-2 border rounded'
            placeholder='New genre name'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type='submit'
            className='bg-green-500 text-white px-4 py-2 rounded'>
            Add
          </button>
        </form>

        {error && <p className='text-red-500 mb-4'>{error}</p>}

        {loading ? (
          <p>Loading genres…</p>
        ) : genres.length > 0 ? (
          <ul className='space-y-3'>
            {genres.map((g) => (
              <li
                key={g._id}
                className='bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center'>
                <span className='dark:text-white'>{g.name}</span>
                <button
                  onClick={() => handleDelete(g._id)}
                  className='bg-red-400 text-white px-2 py-1 rounded'>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-gray-500 dark:text-gray-400'>No genres found.</p>
        )}
      </div>
    </>
  );
}
