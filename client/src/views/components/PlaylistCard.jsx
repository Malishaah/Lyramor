import React from 'react';
import avatar from '../../assets/lyramor.svg';

/**
 * @typedef {Object} Playlist
 * @property {string} _id
 * @property {string} name
 * @property {string} [description]
 * @property {{ _id: string, name: string }} [genre]
 * @property {Array<{ _id: string, title: string, artist: { _id: string, name: string } }>} [songs]
 * @property {{ _id: string, username: string }} createdBy
 */

/**
 * @param {{ playlist: Playlist, canEdit: boolean, onEdit: () => void, onDelete: () => void }} props
 */
export function PlaylistCard({ playlist, canEdit, onEdit, onDelete }) {
  // Derive creation date from Mongo ObjectID
  const timestamp = parseInt(playlist._id.slice(0, 8), 16) * 1000;
  const dateString = new Date(timestamp).toLocaleDateString();

  return (
    <div className='bg-white dark:bg-gray-800 border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow'>
      {/* Header */}
      <div className='flex items-center px-4 py-3'>
        <img
          src={avatar}
          alt='Avatar'
          className='h-8 w-8 rounded-full mr-3object-cover'
        />
        <div className='flex-1'>
          <p className='font-medium dark:text-white'>
            {playlist.createdBy.username}{' '}
            /Users/maliroshanshah/Repos/Lyramor/client
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {dateString}
          </p>
        </div>
        {canEdit && (
          <div className='flex space-x-2'>
            <button onClick={onEdit} title='Edit'>
              ✏️
            </button>
            <button onClick={onDelete} title='Delete'>
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className='p-4'>
        <h2 className='text-xl font-semibold dark:text-white'>
          {playlist.name}
        </h2>
        <p className='text-gray-700 dark:text-gray-300 mb-2'>
          {playlist.description || 'No description.'}
        </p>
        {playlist.genre && (
          <span className='inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded'>
            {playlist.genre.name}
          </span>
        )}
        {playlist.songs && playlist.songs.length > 0 && (
          <div className='mt-3 grid grid-cols-2 gap-2'>
            {playlist.songs.slice(0, 4).map((song) => (
              <div key={song._id} className='text-sm'>
                "{song.title}" - {song.artist.name}
              </div>
            ))}
            {playlist.songs.length > 4 && (
              <div className='text-sm text-gray-500'>
                +{playlist.songs.length - 4} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
