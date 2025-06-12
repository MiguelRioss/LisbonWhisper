//Este modulo Esta responsavel de recolher a data dos parametros/body etc para depois o services
// usar sem ter que se preocupar com isso
export default function (data) {
  return {
    getBookingAndProcessServices,
    createBookingServices,
  };

  async function getBookingAndProcessServices(comparador = {}) {
    // Fetch all bookings from the database
    const bookings = await data.getBookings();
    console.log('Fetched bookings:', bookings);

    // If a comparator is provided, filter the bookings to match
    if (Object.keys(comparador).length > 0) {
      const filteredBookings = bookings.filter((booking) => {
        return Object.keys(comparador).every(
          (key) => booking[key] != null && String(booking[key]) === String(comparador[key])
        );
      });
      return filteredBookings;
    }

    // If no comparator is provided, return all bookings
    return bookings;
  }

  async function createBookingServices(bookingObject) {
    return await data.createBooking(bookingObject);
  }
}
