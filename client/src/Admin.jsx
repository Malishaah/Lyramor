import { useEffect, useState } from 'react';
import Header from './components/Header';
import avatar from './assets/react.svg';
import {
  fetchPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from './api/playlistsClient';

export default function Admin() {
  const [authStatus, setAuthStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  // Check admin session & get user
  useEffect(() => {
    async function check() {
      const res = await fetch('/api/users/session', { credentials: 'include' });
      if (res.ok) {
        const s = await res.json();
        if (s && s.isAdmin) {
          setUser(s);
          setAuthStatus('authorized');
        } else {
          window.location.href = '/';
        }
      } else {
        window.location.href = '/login';
      }
    }
    check();
  }, []);

  // Load playlists once authorized
  useEffect(() => {
    if (authStatus === 'authorized') {
      fetchPlaylists().then(setPlaylists).catch(console.error);
    }
  }, [authStatus]);

  // Filter playlists based on search
  const filtered = playlists.filter(
    (pl) =>
      pl.name.toLowerCase().includes(search.toLowerCase()) ||
      (pl.description &&
        pl.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openNew = () => {
    setForm({ name: '', description: '' });
    setEditId(null);
    setShowModal(true);
  };

  const startEdit = (pl) => {
    setForm({ name: pl.name, description: pl.description || '' });
    setEditId(pl._id);
    setShowModal(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updatePlaylist(editId, form);
    } else {
      await createPlaylist(form);
    }
    setShowModal(false);
    setPlaylists(await fetchPlaylists());
  };

  if (authStatus === 'loading' || !user) {
    return <div>Loading…</div>;
  }

  return (
    <>
      <Header />
      <div className='bg-[#EFE8FF] dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8'>
        {/* Search & New Playlist */}
        <div className='max-w-4xl mx-auto mb-6 flex space-x-2'>
          <input
            className='flex-grow p-2 border rounded'
            placeholder='Search…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={openNew}
            className='px-6 py-2 bg-[#FF9CB4] rounded shadow hover:bg-[#FFB8C9] transform transition-transform duration-150 hover:scale-110'>
            New Playlist
          </button>
        </div>

        {/* Playlists Grid */}
        <div className='grid gap-6 max-w-4xl mx-auto'>
          {filtered.map((pl) => {
            // derive creation date from ObjectId
            const ts = parseInt(pl._id.slice(0, 8), 16) * 1000;
            const dateString = new Date(ts).toLocaleDateString();
            return (
              <div
                key={pl._id}
                className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow'>
                {/* Card Header */}
                <div className='flex items-center px-4 py-3'>
                  <img
                    src={avatar}
                    alt='avatar'
                    className='h-8 w-8 rounded-full mr-3 object-cover'
                  />
                  <div>
                    <p className='font-medium text-gray-900 dark:text-white'>
                      {pl.createdBy?.username || 'Unknown'}
                    </p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {dateString}
                    </p>
                  </div>
                  <div className='ml-auto flex space-x-3 text-lg'>
                    <button
                      onClick={() => startEdit(pl)}
                      className='px-4 py-1 bg-[#FF9CB4] rounded shadow hover:bg-[#FFB8C9] transform transition-transform duration-150 hover:scale-110'>
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(pl._id)}
                      className='px-4 py-1 bg-[#FFBE1E] rounded shadow hover:bg-[#FFDE8C] transform transition-transform duration-150 hover:scale-110'>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className='px-4 py-2'>
                  <h2 className='text-xl font-semibold mb-1 text-gray-900 dark:text-white'>
                    {pl.name}
                  </h2>
                  <p className='text-gray-700 dark:text-gray-300'>
                    {pl.description || 'No description.'}
                  </p>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className='text-center text-gray-500 dark:text-gray-400'>
              No playlists.
            </p>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <form
              onSubmit={handleSubmit}
              className='bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md'>
              <h3 className='text-lg font-bold mb-4 dark:text-white'>
                {editId ? 'Edit Playlist' : 'New Playlist'}
              </h3>
              <label className='block mb-2'>
                Name
                <input
                  name='name'
                  value={form.name}
                  onChange={handleChange}
                  required
                  className='w-full border p-2 rounded mt-1'
                />
              </label>
              <label className='block mb-4'>
                Description
                <textarea
                  name='description'
                  value={form.description}
                  onChange={handleChange}
                  rows='4'
                  className='w-full border p-2 rounded mt-1'
                />
              </label>
              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='text-black px-4 py-2 bg-[#FF9CB4] rounded shadow hover:bg-[#FFB8C9] transform transition-transform duration-150 hover:scale-110'>
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm'>
              <p className='text-gray-900 dark:text-white mb-4'>
                Are you sure you want to delete this playlist?
              </p>
              <div className='flex justify-end space-x-2'>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className='px-4 py-2'>
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (deleteId) {
                      await deletePlaylist(deleteId);
                      setPlaylists(await fetchPlaylists());
                    }
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className='text-black px-4 py-2 rounded-lg bg-[#FFBE1E] shadow hover:bg-[#FFDE8C] transform transition-transform duration-150 hover:scale-110'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
