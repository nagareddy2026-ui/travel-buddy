const express = require('express');
const { db } = require('../server');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create payment (protected)
router.post('/', authMiddleware, (req, res) => {
  const { booking_id, amount, payment_method } = req.body;

  if (!booking_id || !amount || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate transaction ID
  const transaction_id = 'TXN-' + Date.now();

  db.run(
    `INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status) 
     VALUES (?, ?, ?, ?, ?)`,
    [booking_id, amount, payment_method, transaction_id, 'completed'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Failed to process payment' });
      }

      // Update booking status to confirmed
      db.run(
        `UPDATE bookings SET status = ? WHERE id = ?`,
        ['confirmed', booking_id],
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating booking status:', updateErr);
          }
        }
      );

      res.status(201).json({
        message: 'Payment processed successfully',
        paymentId: this.lastID,
        transaction_id
      });
    }
  );
});

// Get payment history (protected)
router.get('/', authMiddleware, (req, res) => {
  db.all(
    `SELECT p.* FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     WHERE b.user_id = ? ORDER BY p.created_at DESC`,
    [req.userId],
    (err, payments) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch payment history' });
      }
      res.json(payments);
    }
  );
});

// Get payment by ID (protected)
router.get('/:id', authMiddleware, (req, res) => {
  db.get(
    `SELECT p.* FROM payments p
     JOIN bookings b ON p.booking_id = b.id
     WHERE p.id = ? AND b.user_id = ?`,
    [req.params.id, req.userId],
    (err, payment) => {
      if (err || !payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      res.json(payment);
    }
  );
});

module.exports = router;
