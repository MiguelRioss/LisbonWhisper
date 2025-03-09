const bookings = {
    bookings: [], // Array to store bookings
  };
  
  export default function () {
    return {
      getBookings,
      createBooking,
    };
  
    // Fetch all bookings
    function getBookings() {
      return bookings;
    }
  
    // Generate a random unique ID
    function generateUniqueId() {
      let newId;
      do {
        // Gera um número aleatório entre 1 e 100000 (pode ajustar o intervalo conforme necessário)
        newId = Math.floor(Math.random() * 100000) + 1;
      } while (bookings.bookings.some((b) => b.id === newId)); // Verifica se o ID já existe
      return newId;
    }
  
    // Create a new booking and assign a unique ID
    function createBooking(booking) {
      booking.id = generateUniqueId(); // Gera um ID único
      bookings.bookings.push(booking); // Adiciona a reserva ao array
      console.log('New booking added:', booking); // Log para depuração
      return booking;
    }
  }
  