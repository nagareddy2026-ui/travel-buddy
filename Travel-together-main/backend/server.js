require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "https://stirring-pasca-16e422.netlify.app",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json()); // ✅ correct place

// Database setup
const db = new sqlite3.Database(
  path.join(__dirname, 'travel.db'),
  (err) => {
    if (err) {
      console.error('Database connection error:', err.message);
    } else {
      console.log('✅ Connected to SQLite database');
    }
  }
);

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        destination TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        travelers INTEGER NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_id TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(booking_id) REFERENCES bookings(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        destination TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

  });
}

// Call initialization
initializeDatabase();

// Routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Travel-Together Backend running on port ${PORT}`);
});