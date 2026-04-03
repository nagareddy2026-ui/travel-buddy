# Quick Start Guide

## Backend Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Step 3: Test the API
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"Server is running","timestamp":"2024-04-03T10:30:00.000Z"}
```

## Connecting Frontend to Backend

### Option 1: Update Your HTML Files

Add this script to your HTML files (before closing `</body>` tag):

```html
<script src="frontend-api.js"></script>
```

Create a `frontend-api.js` file with the API functions (see `FRONTEND_API_INTEGRATION.js`).

### Option 2: Use Direct Fetch Calls

Example in your `login.html`:
```html
<form onsubmit="handleLogin(event)">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<script>
  async function handleLogin(event) {
    event.preventDefault();
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      alert('Login successful!');
    } else {
      alert('Login failed: ' + data.error);
    }
  }
</script>
```

## Database Structure

The database is automatically created with these tables:

1. **users** - Store user accounts
2. **bookings** - Store travel bookings
3. **payments** - Store payment records
4. **feedback** - Store user reviews

## Test Cases

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Get the token from response and use in next requests.

### 3. Create a Booking (replace TOKEN with your token)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"destination":"Paris","start_date":"2024-06-01","end_date":"2024-06-10","travelers":2,"total_price":1500}'
```

### 4. Get User Bookings
```bash
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer TOKEN"
```

### 5. Submit Feedback
```bash
curl -X POST http://localhost:5000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"destination":"Paris","rating":5,"comment":"Amazing trip!"}'
```

### 6. Process Payment
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"booking_id":1,"amount":1500,"payment_method":"credit_card"}'
```

## Backend Folder Structure

```
backend/
├── server.js                          # Main server entry point
├── package.json                       # Dependencies
├── .env                              # Environment variables (IGNORE IN GIT)
├── .gitignore                        # Git ignore rules
├── travel.db                         # SQLite database (created on first run)
├── README.md                         # Backend documentation
├── FRONTEND_API_INTEGRATION.js       # Frontend integration examples
│
├── middleware/
│   └── auth.js                       # JWT authentication middleware
│
└── routes/
    ├── auth.js                       # /api/auth/* routes
    ├── bookings.js                   # /api/bookings/* routes
    ├── payments.js                   # /api/payments/* routes
    ├── feedback.js                   # /api/feedback/* routes
    └── admin.js                      # /api/admin/* routes
```

## Deployment to Render

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Node.js backend"
git push origin main
```

### Step 2: Create New Service on Render
1. Go to render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repo
4. Configure:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Add Environment Variable**: `PORT=5000`

### Step 3: Deploy
Click "Deploy"

Your backend will be live at: `https://your-app-name.onrender.com`

Update frontend API URL to: `https://your-app-name.onrender.com/api`

## Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Port already in use
```bash
# Change PORT in .env
PORT=3001
```

### Database not connecting
```bash
# Delete travel.db and restart
rm travel.db
npm run dev
```

### CORS errors
Make sure your frontend is making requests to the correct backend URL.

## Next Steps

1. Copy `FRONTEND_API_INTEGRATION.js` content to a new `frontend-api.js` file
2. Link it in your HTML files: `<script src="path/to/frontend-api.js"></script>`
3. Update forms to use the API functions
4. Test each endpoint thoroughly
5. Deploy both frontend and backend

## Support & Documentation

- Backend README: [backend/README.md](./README.md)
- Frontend Integration: [backend/FRONTEND_API_INTEGRATION.js](./FRONTEND_API_INTEGRATION.js)
- Express Documentation: https://expressjs.com
- SQLite Documentation: https://www.sqlite.org
