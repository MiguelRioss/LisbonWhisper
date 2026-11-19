const API_BASE = 'https://lisbonwhisper.onrender.com';

// GET: Fetch all bookings
export const fetchBookings = async () => {
  const response = await fetch(`${API_BASE}/bookings`);
  console.log('...Fetching');
  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }
  return await response.json(); // returns { bookings: [...] }
};

// POST: Create a new booking
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ booking: bookingData }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || `Failed to create booking: ${response.statusText}`);
  }

  return payload;
};
