
//Este modulo Esta responsavel de recolher a data dos parametros/body etc para depois o services
// usar sem ter que se preocupar com isso
export default function(WhisperServices) {
    return {
        getBookings : handleRequestNoAuthorization(getBookingsAPI),
        createBooking : handleRequestNoAuthorization(createBookingAPI)
    }

    async function getBookingsAPI(req, rsp) {
        const bookings = await WhisperServices.getBookingAndProcessServices();
        console.log('Fetched bookings:', bookings);
        return bookings; // Return the data to the wrapper
    }
    
    async function getBookingsWithSpecificDayAPI(req, rsp) {
        const { date } = req.query;
        if (!date) {
            throw { status: 400, message: 'Date parameter is required' };
        }

        // Use the services layer to filter bookings by the given date
        const bookings = await WhisperServices.getBookingAndProcessServices({ Date: date });
        console.log('Filtered bookings for date:', date, bookings);

        if (bookings.length === 0) {
            return { message: 'No bookings found for the specified date', bookings: [] };
        }

        return bookings;
    }
    
    async function createBookingAPI(req, rsp) {
        const booking = req.body.booking;
        console.log("bookingObject:  " + booking)
        const createdBooking = await WhisperServices.createBookingServices(booking);
        return { // Return the success response
            statusCode: 200,
            status: `Booking: ${createdBooking.id} created successfully`,
            booking: createdBooking,
        };
    }
    function handleRequestNoAuthorization(handler) {
        return async function (req, rsp) {
            try {
                const body = await handler(req, rsp); // Call the original handler
                rsp.json(body); // Send the result as JSON
            } catch (e) {
                console.error('Error:', e); // Log the error for debugging
                const res = htttpErrors(e); // Transform the error into a proper response format
                rsp.status(res.status || 500).json(res); // Send the error response
            }
        };
    }
    
    // Example `htttpErrors` function to transform errors
    function htttpErrors(error) {
        console.error('Error:', error);
        return {
            status: error.status || 500,
            message: error.message || 'Internal Server Error',
        };
    }
    
}