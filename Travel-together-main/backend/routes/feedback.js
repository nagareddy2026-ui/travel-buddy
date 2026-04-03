const express = require('express');
const { db } = require('../server');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Submit feedback (protected)
router.post('/', authMiddleware, (req, res) => {
  const { destination, rating, comment } = req.body;

  if (!destination || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Invalid input. Rating must be 1-5' });
  }

  db.run(
    `INSERT INTO feedback (user_id, destination, rating, comment) 
     VALUES (?, ?, ?, ?)`,
    [req.userId, destination, rating, comment || null],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to submit feedback' });
      }
      res.status(201).json({ message: 'Feedback submitted successfully', feedbackId: this.lastID });
    }
  );
});

// Get all feedback for a destination
router.get('/destination/:destination', (req, res) => {
  db.all(
    `SELECT * FROM feedback WHERE destination = ? ORDER BY created_at DESC`,
    [req.params.destination],
    (err, feedbacks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch feedback' });
      }
      res.json(feedbacks);
    }
  );
});

// Get user's feedback (protected)
router.get('/', authMiddleware, (req, res) => {
  db.all(
    `SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC`,
    [req.userId],
    (err, feedbacks) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch feedback' });
      }
      res.json(feedbacks);
    }
  );
});

// Update feedback (protected)
router.put('/:id', authMiddleware, (req, res) => {
  const { rating, comment } = req.body;

  db.run(
    `UPDATE feedback SET rating = ?, comment = ? WHERE id = ? AND user_id = ?`,
    [rating, comment, req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to update feedback' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json({ message: 'Feedback updated successfully' });
    }
  );
});

// Delete feedback (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  db.run(
    `DELETE FROM feedback WHERE id = ? AND user_id = ?`,
    [req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to delete feedback' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      res.json({ message: 'Feedback deleted successfully' });
    }
  );
});

module.exports = router;
