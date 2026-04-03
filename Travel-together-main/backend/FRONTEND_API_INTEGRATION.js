// Frontend API Configuration
// Add this to your main.js or create a separate api.js file

const API_BASE_URL = 'http://localhost:5000/api';

// Store token in localStorage
let authToken = localStorage.getItem('authToken');

// Authentication APIs
async function registerUser(username, email, password, phone = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, phone })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Registration successful:', data);
      return data;
    } else {
      console.error('Registration failed:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      console.log('Login successful');
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Booking APIs
async function createBooking(destination, start_date, end_date, travelers, total_price) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ destination, start_date, end_date, travelers, total_price })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Booking created:', data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
}

async function getUserBookings() {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    console.log('User bookings:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

// Payment APIs
async function processPayment(booking_id, amount, payment_method) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ booking_id, amount, payment_method })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Payment processed:', data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}

// Feedback APIs
async function submitFeedback(destination, rating, comment = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ destination, rating, comment })
    });
    const data = await response.json();
    if (response.ok) {
      console.log('Feedback submitted:', data);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Feedback error:', error);
    throw error;
  }
}

async function getDestinationFeedback(destination) {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/destination/${destination}`, {
      method: 'GET'
    });
    const data = await response.json();
    console.log('Destination feedback:', data);
    return data;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
}

// Usage Examples in HTML

/*
LOGIN FORM EXAMPLE:
<form onsubmit="handleLogin(event)">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<script>
  async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      await loginUser(email, password);
      alert('Login successful!');
      // Redirect to dashboard
      window.location.href = '/index.html';
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  }
</script>

BOOKING FORM EXAMPLE:
<form onsubmit="handleBooking(event)">
  <input type="text" id="destination" placeholder="Destination" required>
  <input type="date" id="startDate" required>
  <input type="date" id="endDate" required>
  <input type="number" id="travelers" min="1" required>
  <input type="number" id="price" step="0.01" required>
  <button type="submit">Book Now</button>
</form>

<script>
  async function handleBooking(event) {
    event.preventDefault();
    if (!authToken) {
      alert('Please login first');
      return;
    }
    
    try {
      const result = await createBooking(
        document.getElementById('destination').value,
        document.getElementById('startDate').value,
        document.getElementById('endDate').value,
        document.getElementById('travelers').value,
        document.getElementById('price').value
      );
      alert('Booking created! ID: ' + result.bookingId);
    } catch (error) {
      alert('Booking failed: ' + error.message);
    }
  }
</script>

FEEDBACK FORM EXAMPLE:
<form onsubmit="handleFeedback(event)">
  <input type="text" id="destination" placeholder="Destination" required>
  <select id="rating" required>
    <option value="">Select Rating</option>
    <option value="1">1 Star</option>
    <option value="2">2 Stars</option>
    <option value="3">3 Stars</option>
    <option value="4">4 Stars</option>
    <option value="5">5 Stars</option>
  </select>
  <textarea id="comment" placeholder="Your feedback"></textarea>
  <button type="submit">Submit Feedback</button>
</form>

<script>
  async function handleFeedback(event) {
    event.preventDefault();
    if (!authToken) {
      alert('Please login first');
      return;
    }
    
    try {
      await submitFeedback(
        document.getElementById('destination').value,
        document.getElementById('rating').value,
        document.getElementById('comment').value
      );
      alert('Thank you for your feedback!');
    } catch (error) {
      alert('Error submitting feedback: ' + error.message);
    }
  }
</script>

GET USER BOOKINGS EXAMPLE:
<button onclick="loadUserBookings()">View My Bookings</button>
<div id="bookingsList"></div>

<script>
  async function loadUserBookings() {
    if (!authToken) {
      alert('Please login first');
      return;
    }
    
    try {
      const bookings = await getUserBookings();
      let html = '<ul>';
      bookings.forEach(booking => {
        html += `<li>
          ${booking.destination} - ${booking.start_date} to ${booking.end_date}
          Status: ${booking.status}
        </li>`;
      });
      html += '</ul>';
      document.getElementById('bookingsList').innerHTML = html;
    } catch (error) {
      alert('Error loading bookings: ' + error.message);
    }
  }
</script>

CHECKOUT WITH PAYMENT:
<form onsubmit="handleCheckout(event)">
  <input type="hidden" id="bookingId" value="">
  <input type="number" id="amount" placeholder="Amount" step="0.01" required>
  <select id="paymentMethod" required>
    <option value="">Select Payment Method</option>
    <option value="credit_card">Credit Card</option>
    <option value="debit_card">Debit Card</option>
    <option value="paypal">PayPal</option>
  </select>
  <button type="submit">Complete Payment</button>
</form>

<script>
  async function handleCheckout(event) {
    event.preventDefault();
    if (!authToken) {
      alert('Please login first');
      return;
    }
    
    try {
      await processPayment(
        document.getElementById('bookingId').value,
        document.getElementById('amount').value,
        document.getElementById('paymentMethod').value
      );
      alert('Payment successful!');
    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
  }
</script>
*/
