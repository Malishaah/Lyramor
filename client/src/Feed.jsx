import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
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

export default function Feed() {
  const qc = useQueryClient();

  // Queries: always called in same order
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

  // Mutations: always called in same order
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

  // Component state
  const [modalData, setModalData] = useState(null);
  const [search, setSearch] = useState('');

  // Loading & error
  if (
    sessionQ.isLoading ||
    playlistsQ.isLoading ||
    genresQ.isLoading ||
    songsQ.isLoading
  ) {
    return <div>Loading…</div>;
  }
  if (playlistsQ.isError) {
    return <div>Error: {String(playlistsQ.error)}</div>;
  }

  const user = sessionQ.data;

  // Map genres by id for lookup
  const genresById = useMemo(() => {
    return genresQ.data.reduce((map, g) => {
      map[g._id] = g.name;
      return map;
    }, {});
  }, [genresQ.data]);

  // Filter and group playlists
  const groupedPlaylists = useMemo(() => {
    return playlistsQ.data
      .filter(
        (pl) =>
          pl.name.toLowerCase().includes(search.toLowerCase()) ||
          (pl.description || '').toLowerCase().includes(search.toLowerCase())
      )
      .map((pl) => {
        const grouped = {};
        (pl.songs || []).forEach((ps) => {
          const songId = typeof ps === 'string' ? ps : ps._id;
          const song = songsQ.data.find((s) => s._id === songId);
          if (!song) return;
          const genreId =
            typeof song.genre === 'string' ? song.genre : song.genre?._id;
          const genreName = genresById[genreId] || 'Unknown Genre';
          const artistName = song.artist?.name || 'Unknown Artist';
          if (!grouped[genreName]) grouped[genreName] = {};
          if (!grouped[genreName][artistName])
            grouped[genreName][artistName] = [];
          grouped[genreName][artistName].push(song);
        });
        return { ...pl, grouped };
      });
  }, [playlistsQ.data, search, songsQ.data, genresById]);

  return (
    <>
      <Header />
      <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-100 via-indigo-100 to-[#EFE8FF] dark:from-gray-800 dark:to-gray-900'>
        <div className='max-w-4xl mx-auto mb-10'>
          {/* Search & New */}
          <div className='mb-6 flex space-x-3'>
            <input
              type='text'
              className='flex-grow p-3 border rounded-lg shadow-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none'
              placeholder='Search playlists...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type='button'
              onClick={() => setModalData({ playlist: {} })}
              className='px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700'>
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
                <div
                  key={pl._id}
                  className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg'>
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
                          onClick={() =>
                            setModalData({ id: pl._id, playlist: pl })
                          }
                          className='text-blue-600 dark:text-blue-400 hover:underline'>
                          Edit
                        </button>
                        <button
                          type='button'
                          onClick={() => deleteM.mutate(pl._id)}
                          className='text-red-600 dark:text-red-400 hover:underline'>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Grouped list */}
                  <dl className='space-y-4'>
                    {Object.entries(pl.grouped).map(([genre, artists]) => (
                      <div key={genre}>
                        <dt className='text-indigo-600 font-bold'>{genre}</dt>
                        <dd className='pl-4 space-y-2'>
                          {Object.entries(artists).map(([artist, songs]) => (
                            <div key={artist}>
                              <dt className='font-semibold'>{artist}</dt>
                              <dd className='pl-4 list-disc list-inside space-y-1'>
                                {songs.map((song) => (
                                  <div
                                    key={song._id}
                                    className='flex items-center space-x-2'>
                                    <span>{song.title}</span>
                                    {song.trackUrl && (
                                      <audio controls>
                                        <source
                                          src={song.trackUrl}
                                          type='audio/mpeg'
                                        />
                                      </audio>
                                    )}
                                  </div>
                                ))}
                              </dd>
                            </div>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
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
                {modalData.id ? 'Edit' : 'New'} Playlist
              </h3>

              {/* Name & Description */}
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

              {/* Genre */}
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
                  className='w-full border p-2 rounded dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600'>
                  <option value=''>-- Select Genre --</option>
                  {genresQ.data.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Songs */}
              <div>
                <label className='block mb-1 text-gray-700 dark:text-gray-300'>
                  Songs
                </label>
                <select
                  multiple
                  value={modalData.playlist.songs || []}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (o) => o.value
                    );
                    setModalData((m) => ({
                      ...m,
                      playlist: { ...m.playlist, songs: selected },
                    }));
                  }}
                  className='w-full border p-2 rounded h-32 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600'>
                  {songsQ.data.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} — {s.artist?.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setModalData(null)}
                  className='px-4 py-2 text-gray-600 dark:text-gray-300'>
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600'>
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
