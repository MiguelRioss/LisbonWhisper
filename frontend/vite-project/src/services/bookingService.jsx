const API_BASE = 'http://localhost:1904';

// GET: Fetch all bookings
export const fetchBookings = async () => {
  const response = await fetch(`${API_BASE}/bookings`);
  console.log("...Fetching")
  if (!response.ok) {
    throw new Error(`Failed to fetch bookings: ${response.statusText}`);
  }
  return await response.json(); // returns { bookings: [...] }
};

// POST: Create a new booking
export const createBooking = async (bookingData) => {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ booking: bookingData })
  });
  console.log(bookingData);
  if (!response.ok) {
    throw new Error(`Failed to create booking: ${response.statusText}`);
  }

  return await response.json(); // Optional: you can return created booking
};
