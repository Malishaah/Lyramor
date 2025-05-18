// src/controllers/logout.js
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json('Error during logout');
    }
    // Clear the session cookie and send 204 No Content
    res.clearCookie('connect.sid');
    res.sendStatus(204);
  });
};
