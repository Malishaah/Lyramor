// src/components/UserManagement.jsx
import { useEffect, useState } from 'react';
import Header from './components/Header';
import { fetchUsers, updateUserRole, deleteUser } from './api/userClient';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (e) {
        setError(e.message || 'Kunde inte hämta användare.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleAdmin = async (user) => {
    setError(null);
    try {
      const updated = await updateUserRole(user._id, !user.isAdmin);
      setUsers(users.map((u) => (u._id === user._id ? updated : u)));
    } catch (e) {
      setError(e.message || 'Kunde inte uppdatera rollen.');
    }
  };

  const openDeleteModal = (id) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setSelectedUserId(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    setError(null);
    try {
      await deleteUser(selectedUserId);
      setUsers(users.filter((u) => u._id !== selectedUserId));
    } catch (e) {
      setError(e.message || 'Kunde inte ta bort användaren.');
    } finally {
      closeDeleteModal();
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className='p-4 bg-red-200 text-red-800'>{error}</div>;

  return (
    <div className='bg-[#EFE8FF] min-h-screen'>
      <Header />
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold mb-4'>User Management</h1>
        <table className='min-w-full bg-white dark:bg-gray-800 rounded shadow'>
          <thead>
            <tr className='text-left'>
              <th className='px-4 py-2'>Username</th>
              <th className='px-4 py-2'>Role</th>
              <th className='px-4 py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className='border-t'>
                <td className='px-4 py-2'>{user.username}</td>
                <td className='px-4 py-2'>{user.isAdmin ? 'Admin' : 'User'}</td>
                <td className='px-4 py-2 space-x-2'>
                  <button
                    onClick={() => handleToggleAdmin(user)}
                    className='px-2 py-1 bg-indigo-200 rounded hover:bg-indigo-300 transform transition-transform duration-150 hover:scale-110 mr-4'>
                    {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => openDeleteModal(user._id)}
                    className='px-6 py-1 bg-[#FFBE1E] rounded shadow hover:bg-[#FFDE8C] transform transition-transform duration-150 hover:scale-110'>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-sm'>
            <h2 className='text-lg font-semibold mb-4'>Confirm Deletion</h2>
            <p className='mb-6'>Are you sure you want to delete this user?</p>
            <div className='flex justify-end space-x-4'>
              <button onClick={closeDeleteModal} className='px-4 py-2'>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 bg-[#FFBE1E] rounded shadow hover:bg-[#FFDE8C] transform transition-transform duration-150 hover:scale-110'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
