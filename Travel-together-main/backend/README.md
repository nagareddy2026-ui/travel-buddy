# Travel-Together Backend

A Node.js/Express backend for the Travel-Together travel booking application with SQLite database.

## Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Booking Management (Create, Read, Update, Delete)
- ✅ Payment Processing
- ✅ Feedback & Reviews System
- ✅ Admin Dashboard API
- ✅ SQLite Database

## Installation

### 1. Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 2. Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
DATABASE=travel.db
NODE_ENV=development
```

## Running the Server

### Development (with auto-reload):
```bash
npm run dev
```

### Production:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings` - Get user bookings (protected)
- `GET /api/bookings/:id` - Get booking detail (protected)
- `PUT /api/bookings/:id` - Update booking (protected)
- `DELETE /api/bookings/:id` - Cancel booking (protected)

### Payments
- `POST /api/payments` - Process payment (protected)
- `GET /api/payments` - Get payment history (protected)
- `GET /api/payments/:id` - Get payment detail (protected)

### Feedback
- `POST /api/feedback` - Submit feedback (protected)
- `GET /api/feedback` - Get user feedback (protected)
- `GET /api/feedback/destination/:destination` - Get destination feedback
- `PUT /api/feedback/:id` - Update feedback (protected)
- `DELETE /api/feedback/:id` - Delete feedback (protected)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/bookings` - Get all bookings (admin only)
- `GET /api/admin/bookings/status/:status` - Get bookings by status (admin only)
- `PUT /api/admin/bookings/:id/status` - Update booking status (admin only)
- `GET /api/admin/payments` - Get all payments (admin only)
- `GET /api/admin/stats` - Get dashboard statistics (admin only)

### Health Check
- `GET /api/health` - Check server status

## Database Schema

### Users Table
```sql
id, username, email, password, phone, created_at
```

### Bookings Table
```sql
id, user_id, destination, start_date, end_date, travelers, total_price, status, created_at
```

### Payments Table
```sql
id, booking_id, amount, payment_method, transaction_id, status, created_at
```

### Feedback Table
```sql
id, user_id, destination, rating, comment, created_at
```

## Usage Example

### Register User
```bash
curl -X POST "http://localhost:5000/api"/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john\",\"email\":\"john@example.com\",\"password\":\"123456\"}"
```

### Login
```bash
curl -X POST "http://stirring-pasca-16e422.netlify.app"/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"123456\"}"
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {"id": 1, "username": "john", "email": "john@example.com"}
}
```

### Create Booking (use token from login)
```bash
curl -X POST "http://stirring-pasca-16e422.netlify.app/"/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d "{\"destination\":\"Paris\",\"start_date\":\"2024-06-01\",\"end_date\":\"2024-06-10\",\"travelers\":2,\"total_price\":1500}"
```

## Folder Structure

```
backend/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables
├── travel.db               # SQLite database
├── middleware/
│   └── auth.js             # JWT authentication
└── routes/
    ├── auth.js             # Authentication routes
    ├── bookings.js         # Booking routes
    ├── payments.js         # Payment routes
    ├── feedback.js         # Feedback routes
    └── admin.js            # Admin routes
```

## Notes

- All protected routes require a JWT token in the Authorization header
- Passwords are hashed using bcryptjs
- The database is created automatically on first run
- Admin access is currently based on user ID 1 (configure as needed)

## Future Enhancements

- Email notifications
- SMS alerts
- Payment gateway integration (Stripe, PayPal)
- Real-time notifications
- Search and filter functionality
- Rate limiting and security hardening
