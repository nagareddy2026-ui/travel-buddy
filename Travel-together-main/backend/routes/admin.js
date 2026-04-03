const express = require('express');
const { db } = require('../server');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Admin check (simplified - in production, use role-based access)
const isAdmin = (req, res, next) => {
  // For now, we'll assume admin is a user with ID 1
  // In production, implement proper admin authentication
  if (req.userId === 1) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Get all users (admin only)
router.get('/users', authMiddleware, isAdmin, (req, res) => {
  db.all(
    `SELECT id, username, email, phone, created_at FROM users`,
    [],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(users);
    }
  );
});

// Get all bookings (admin only)
router.get('/bookings', authMiddleware, isAdmin, (req, res) => {
  db.all(
    `SELECT b.*, u.username, u.email FROM bookings b 
     JOIN users u ON b.user_id = u.id 
     ORDER BY b.created_at DESC`,
    [],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookings' });
      }
      res.json(bookings);
    }
  );
});

// Get bookings by status (admin only)
router.get('/bookings/status/:status', authMiddleware, isAdmin, (req, res) => {
  db.all(
    `SELECT b.*, u.username, u.email FROM bookings b 
     JOIN users u ON b.user_id = u.id 
     WHERE b.status = ? 
     ORDER BY b.created_at DESC`,
    [req.params.status],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookings' });
      }
      res.json(bookings);
    }
  );
});

// Update booking status (admin only)
router.put('/bookings/:id/status', authMiddleware, isAdmin, (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  db.run(
    `UPDATE bookings SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to update booking status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json({ message: 'Booking status updated successfully' });
    }
  );
});

// Get all payments (admin only)
router.get('/payments', authMiddleware, isAdmin, (req, res) => {
  db.all(
    `SELECT p.*, b.user_id FROM payments p 
     JOIN bookings b ON p.booking_id = b.id 
     ORDER BY p.created_at DESC`,
    [],
    (err, payments) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch payments' });
      }
      res.json(payments);
    }
  );
});

// Get dashboard statistics (admin only)
router.get('/stats', authMiddleware, isAdmin, (req, res) => {
  Promise.all([
    new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM users`, (err, result) => {
        resolve(err ? 0 : result.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM bookings`, (err, result) => {
        resolve(err ? 0 : result.count);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(`SELECT SUM(amount) as total FROM payments WHERE status = ?`, ['completed'], (err, result) => {
        resolve(err || !result.total ? 0 : result.total);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as count FROM bookings WHERE status = ?`, ['confirmed'], (err, result) => {
        resolve(err ? 0 : result.count);
      });
    })
  ]).then(([totalUsers, totalBookings, totalRevenue, confirmedBookings]) => {
    res.json({
      totalUsers,
      totalBookings,
      totalRevenue,
      confirmedBookings
    });
  });
});

module.exports = router;
