using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // Base route: /api/bookings
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
            var booking = _context.Bookings.Find(b => b.BookingId == id).FirstOrDefault();
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        // POST: /api/bookings
        [HttpPost]
        public IActionResult CreateBooking([FromBody] Booking booking)
        {
            booking.BookingId = Guid.NewGuid().ToString();   // generate GUID string
            booking.BookingDate = DateTime.UtcNow;           // set booking timestamp

            // ✅ Validate user, event, and ticket type exist
            var userExists = _context.Users.Find(u => u.UserId == booking.UserId).Any();
            var eventExists = _context.Events.Find(e => e.EventId == booking.EventId).Any();
            var ticketType = _context.TicketTypes.Find(t => t.TicketTypeId == booking.TicketTypeId).FirstOrDefault();

            if (!userExists || !eventExists || ticketType == null)
                return BadRequest("Invalid UserId, EventId, or TicketTypeId.");

            // ✅ Calculate total amount
            booking.TotalAmount = ticketType.Price * booking.Quantity;

            _context.Bookings.InsertOne(booking);
            return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingId }, booking);
        }

        // DELETE: /api/bookings/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteBooking(string id)
        {
            var result = _context.Bookings.DeleteOne(b => b.BookingId == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }
}
