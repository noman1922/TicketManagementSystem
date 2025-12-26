using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public BookingsController(MongoDbContext context)
        {
            _context = context;
        }

        // GET: /api/bookings
        [HttpGet]
        public IActionResult GetBookings()
        {
            var bookings = _context.Bookings.Find(_ => true).ToList();
            return Ok(bookings);
        }

        // GET: /api/bookings/{id}
        [HttpGet("{id}")]
        public IActionResult GetBooking(string id)
        {
            // FIXED: Use Id instead of BookingId
            var booking = _context.Bookings.Find(b => b.Id == id).FirstOrDefault();
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        // POST: /api/bookings
        [HttpPost]
        public IActionResult CreateBooking([FromBody] Booking booking)
        {
            // REMOVED: booking.BookingId = Guid.NewGuid().ToString();
            booking.BookingDate = DateTime.UtcNow;

            // FIXED: Check if user exists by Id (not UserId)
            var userExists = _context.Users.Find(u => u.Id == booking.UserId).Any();
            
            // FIXED: Check if event exists by Id
            var eventExists = _context.Events.Find(e => e.Id == booking.EventId).Any();
            
            // FIXED: Check if ticket type exists by Id
            var ticketType = _context.TicketTypes.Find(t => t.Id == booking.TicketTypeId).FirstOrDefault();

            if (!userExists || !eventExists || ticketType == null)
                return BadRequest("Invalid UserId, EventId, or TicketTypeId.");

            // Calculate total amount
            booking.TotalAmount = ticketType.Price * booking.Quantity;

            _context.Bookings.InsertOne(booking);
            
            // FIXED: Return Id instead of BookingId
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }

        // DELETE: /api/bookings/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteBooking(string id)
        {
            // FIXED: Use Id instead of BookingId
            var result = _context.Bookings.DeleteOne(b => b.Id == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }
}