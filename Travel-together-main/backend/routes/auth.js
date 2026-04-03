const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../server');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  const { username, email, password, phone } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)`,
    [username, email, hashedPassword, phone || null],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'User already exists or invalid data' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }
  );
});

// Get user profile (protected)
router.get('/profile', authMiddleware, (req, res) => {
  db.get(
    `SELECT id, username, email, phone, created_at FROM users WHERE id = ?`,
    [req.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// Update profile (protected)
router.put('/profile', authMiddleware, (req, res) => {
  const { username, phone } = req.body;

  db.run(
    `UPDATE users SET username = ?, phone = ? WHERE id = ?`,
    [username, phone, req.userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to update profile' });
      }
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

module.exports = router;
