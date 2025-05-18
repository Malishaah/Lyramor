/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {boolean} isAdmin
 */

/** Hämta inloggad användarsession (kräver auth) */
export async function getSession() {
  const res = await fetch('/api/users/session');
  if (!res.ok) throw new Error('Failed to fetch session');
  /** @type {User} */
  const user = await res.json();
  return user;
}

/** Logga in användare */
export async function loginUser(username, password) {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const contentType = res.headers.get('content-type');
  if (!res.ok) {
    if (contentType?.includes('application/json')) {
      const data = await res.json();
      throw new Error(data.message || 'Login failed');
    } else {
      const text = await res.text();
      throw new Error(text || 'Login failed');
    }
  }

  return res.json();
}

/** Hämta alla användare (admin-only) */
export async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  /** @type {User[]} */
  const users = await res.json();
  return users;
}

/** Uppdatera användarroll (admin-only) */
export async function updateUserRole(id, isAdmin) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isAdmin }),
  });
  if (!res.ok) throw new Error('Failed to update user role');
  /** @type {User} */
  const updated = await res.json();
  return updated;
}

/** Radera en användare (admin-only) */
export async function deleteUser(id) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete user');
}
