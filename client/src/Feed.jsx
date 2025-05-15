import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MusicNoteIcon } from '@heroicons/react/outline';

import {
  createPlaylist,
  deletePlaylist,
  fetchPlaylists,
  updatePlaylist,
} from './api/playlistsClient';
import { fetchGenres } from './api/genresClient';
import { fetchSongs } from './api/songsClient';
import { getSession } from './api/userClient';
import Header from './components/Header';

function PlaylistCard({ pl, user, deleteM, setModalData }) {
  const genres = Object.keys(pl.grouped);
  const [activeGenre, setActiveGenre] = useState(genres[0] || '');

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg'>
      <div className='flex justify-between items-center mb-3'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            {pl.name}
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {pl.description}
          </p>
        </div>
        {(user.isAdmin || pl.createdBy._id === user._id) && (
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setModalData({ id: pl._id, playlist: pl })}
              className='px-8 py-1 bg-[#FFBE1E] rounded hover:bg-[#FFDE8C] transform transition-transform duration-150 hover:scale-110 mr-4'>
              Edit
            </button>
            <button
              type='button'
              onClick={() => deleteM.mutate(pl._id)}
              className='px-6 py-2 text-white bg-[#D3504A] rounded shadow hover:bg-[#EA726D] transform transition-transform duration-150 hover:scale-110'>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Tabs for genres */}
      <div className='border-b border-gray-200 dark:border-gray-700 mb-4'>
        <nav className='-mb-px flex space-x-4'>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`py-2 px-3 font-medium text-sm whitespace-nowrap focus:outline-none ${
                activeGenre === genre
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {genre}
            </button>
          ))}
        </nav>
      </div>

      {/* Content for active genre */}
      <div className='pl-2'>
        {pl.grouped[activeGenre] &&
          Object.entries(pl.grouped[activeGenre]).map(([artist, songs]) => (
            <div key={artist} className='mb-4'>
              <h5 className='font-semibold text-gray-800 dark:text-gray-200'>
                {artist}
              </h5>
              <ul className='space-y-4'>
                {songs.map((song) => (
                  <li
                    key={song._id}
                    className='
        flex flex-col sm:flex-row sm:items-center
        p-4 bg-white dark:bg-gray-800
        rounded-lg shadow 
        hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700
        transition-all
      '>
                    {/* Titel + ikon */}
                    <div className='flex items-center space-x-3'>
                      <MusicNoteIcon className='h-6 w-6 text-indigo-500 dark:text-indigo-400' />
                      <span className='text-gray-900 dark:text-gray-100 font-medium text-lg'>
                        {song.title}
                      </span>
                    </div>

                    {/* Wrapper som växer */}
                    {song.trackUrl && (
                      <div className='mt-3 sm:mt-0 sm:ml-4 flex-1 min-w-0'>
                        <audio
                          controls
                          className='
              w-full 
              bg-gray-100 dark:bg-gray-700 
              rounded-md p-1
            '>
                          <source src={song.trackUrl} type='audio/mpeg' />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function Feed() {
  const qc = useQueryClient();

  // Hooks in fixed order
  const sessionQ = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    retry: false,
  });
  const playlistsQ = useQuery({
    queryKey: ['playlists'],
    queryFn: fetchPlaylists,
  });
  const genresQ = useQuery({ queryKey: ['genres'], queryFn: fetchGenres });
  const songsQ = useQuery({ queryKey: ['songs'], queryFn: fetchSongs });

  const createM = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => qc.invalidateQueries(['playlists']),
  });
  const updateM = useMutation({
    mutationFn: ({ id, playlist }) => updatePlaylist(id, playlist),
    onSuccess: () => qc.invalidateQueries(['playlists']),
  });
  const deleteM = useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => qc.invalidateQueries(['playlists']),
  });

  const [modalData, setModalData] = useState(null);
  const [search, setSearch] = useState('');

  if (
    sessionQ.isLoading ||
    playlistsQ.isLoading ||
    genresQ.isLoading ||
    songsQ.isLoading
  )
    return <div>Loading…</div>;
  if (playlistsQ.isError) return <div>Error: {String(playlistsQ.error)}</div>;

  const user = sessionQ.data;

  const genresById = genresQ.data.reduce((map, g) => {
    map[g._id] = g.name;
    return map;
  }, {});

  const filtered = playlistsQ.data.filter(
    (pl) =>
      pl.name.toLowerCase().includes(search.toLowerCase()) ||
      (pl.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const groupedPlaylists = filtered.map((pl) => {
    const grouped = {};
    (pl.songs || []).forEach((ps) => {
      const id = typeof ps === 'string' ? ps : ps._id;
      const song = songsQ.data.find((s) => s._id === id);
      if (!song) return;
      const genreId =
        typeof song.genre === 'string' ? song.genre : song.genre?._id;
      const genreName = genresById[genreId] || 'Unknown Genre';
      const artistName = song.artist?.name || 'Unknown Artist';
      grouped[genreName] = grouped[genreName] || {};
      grouped[genreName][artistName] = grouped[genreName][artistName] || [];
      grouped[genreName][artistName].push(song);
    });
    return { ...pl, grouped };
  });

  return (
    <>
      <Header />
      <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br bg-[#FEF1DC] dark:from-gray-800 dark:to-gray-900'>
        <div className='max-w-4xl mx-auto mb-10'>
          {/* Search & New */}
          <div className='mb-6 flex space-x-3'>
            <input
              type='text'
              className='flex-grow p-3 border rounded-lg shadow-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              placeholder='Search playlists...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type='button'
              onClick={() => setModalData({ playlist: {} })}
              className='px-10 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow transform transition-transform duration-150 hover:scale-110'>
              + New
            </button>
          </div>

          {/* Playlist Cards */}
          <div className='grid gap-6'>
            {groupedPlaylists.length === 0 ? (
              <p className='text-center text-gray-500 dark:text-gray-400'>
                No playlists found.
              </p>
            ) : (
              groupedPlaylists.map((pl) => (
                <PlaylistCard
                  key={pl._id}
                  pl={pl}
                  user={user}
                  deleteM={deleteM}
                  setModalData={setModalData}
                />
              ))
            )}
          </div>
        </div>

        {/* Modal Form */}
        {modalData && (
          <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const payload = modalData.id
                  ? { id: modalData.id, playlist: modalData.playlist }
                  : { ...modalData.playlist, createdBy: user._id };
                modalData.id
                  ? updateM.mutate(payload)
                  : createM.mutate(payload);
                setModalData(null);
              }}
              className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md space-y-4'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                {modalData.id ? 'Edit' : 'Create'} Playlist
              </h3>
              {['name', 'description'].map((field) => (
                <div key={field}>
                  <label className='block mb-1 text-gray-700 dark:text-gray-300'>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {field === 'description' ? (
                    <textarea
                      rows={3}
                      value={modalData.playlist[field] || ''}
                      onChange={(e) =>
                        setModalData((m) => ({
                          ...m,
                          playlist: { ...m.playlist, [field]: e.target.value },
                        }))
                      }
                      className='w-full border p-2 rounded dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600'
                    />
                  ) : (
                    <input
                      value={modalData.playlist[field] || ''}
                      onChange={(e) =>
                        setModalData((m) => ({
                          ...m,
                          playlist: { ...m.playlist, [field]: e.target.value },
                        }))
                      }
                      className='w-full border p-2 rounded dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600'
                    />
                  )}
                </div>
              ))}
              <div>
                <label className='block mb-1 text-gray-700 dark:text-gray-300'>
                  Genre
                </label>
                <select
                  value={modalData.playlist.genre || ''}
                  onChange={(e) =>
                    setModalData((m) => ({
                      ...m,
                      playlist: { ...m.playlist, genre: e.target.value },
                    }))
                  }
                  className='w-full border p-2 rounded dark:bg-gray-700 dark:text-white	border-gray-300 dark:border-gray-600'>
                  <option value=''>-- Select Genre --</option>
                  {genresQ.data.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block mb-1 text-gray-700 dark:text-gray-300'>
                  Songs
                </label>
                <select
                  multiple
                  value={modalData.playlist.songs || []}
                  onChange={(e) => {
                    const sel = Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    );
                    setModalData((m) => ({
                      ...m,
                      playlist: { ...m.playlist, songs: sel },
                    }));
                  }}
                  className='w-full border p-2 rounded	h-32 dark:bg-gray-700 dark:border-gray-600'>
                  {songsQ.data.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} — {s.artist?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setModalData(null)}
                  className='px-4 py-2 text-gray-600 dark:text-gray-300'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transform transition-transform duration-150 hover:scale-110'>
                  {modalData.id ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
