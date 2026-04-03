const express = require('express');
const { db } = require('../server');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create booking (protected)
router.post('/', authMiddleware, (req, res) => {
  const { destination, start_date, end_date, travelers, total_price } = req.body;

  if (!destination || !start_date || !end_date || !travelers || !total_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO bookings (user_id, destination, start_date, end_date, travelers, total_price) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, destination, start_date, end_date, travelers, total_price],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to create booking' });
      }
      res.status(201).json({ message: 'Booking created successfully', bookingId: this.lastID });
    }
  );
});

// Get user's bookings (protected)
router.get('/', authMiddleware, (req, res) => {
  db.all(
    `SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC`,
    [req.userId],
    (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookings' });
      }
      res.json(bookings);
    }
  );
});

// Get booking by ID (protected)
router.get('/:id', authMiddleware, (req, res) => {
  db.get(
    `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
    [req.params.id, req.userId],
    (err, booking) => {
      if (err || !booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    }
  );
});

// Update booking (protected)
router.put('/:id', authMiddleware, (req, res) => {
  const { destination, start_date, end_date, travelers, total_price, status } = req.body;

  db.run(
    `UPDATE bookings SET destination = ?, start_date = ?, end_date = ?, travelers = ?, total_price = ?, status = ? 
     WHERE id = ? AND user_id = ?`,
    [destination, start_date, end_date, travelers, total_price, status, req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to update booking' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json({ message: 'Booking updated successfully' });
    }
  );
});

// Cancel booking (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM bookings WHERE id = ? AND user_id = ?`,
    [req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to cancel booking' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json({ message: 'Booking cancelled successfully' });
    }
  );
});

module.exports = router;
