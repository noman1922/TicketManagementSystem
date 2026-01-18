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
        [Microsoft.AspNetCore.Authorization.Authorize] // ✅ OPTIONAL: Start enforcing login for bookings?
        // For now, let's just checking specific line logic
        public IActionResult CreateBooking([FromBody] Booking booking)
        {
            // ✅ LINK USER ID FROM TOKEN
            // If the user is logged in, this claim will exist.
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                booking.UserId = userId; // Check if model has UserId field
            }
            
            // REMOVED: booking.BookingId = Guid.NewGuid().ToString();
            booking.BookingDate = DateTime.UtcNow;

            // FIXED: Check if event exists by Id
            var eventExists = _context.Events.Find(e => e.Id == booking.EventId).Any();
            
            // FIXED: Check if ticket type exists by Id
            var ticketType = _context.TicketTypes.Find(t => t.Id == booking.TicketTypeId).FirstOrDefault();

            if (!eventExists || ticketType == null)
                return BadRequest("Invalid EventId or TicketTypeId.");

            // ✅ Check Inventory
            if (ticketType.AvailableQuantity < booking.Quantity)
            {
                return BadRequest($"Not enough tickets available. Only {ticketType.AvailableQuantity} left.");
            }

            // Calculate total amount
            booking.TotalAmount = ticketType.Price * booking.Quantity;
            booking.Status = "Pending";

            _context.Bookings.InsertOne(booking);

            // ✅ Decrement Inventory
            var update = Builders<TicketType>.Update.Inc(t => t.AvailableQuantity, -booking.Quantity);
            _context.TicketTypes.UpdateOne(t => t.Id == ticketType.Id, update);
            
            // FIXED: Return Id instead of BookingId
            return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
        }

        // GET: /api/bookings/my-bookings
        [HttpGet("my-bookings")]
        [Microsoft.AspNetCore.Authorization.Authorize] // Require Login
        public IActionResult GetMyBookings()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var bookings = _context.Bookings.Find(b => b.UserId == userId).ToList();
            
            // Enrich with Event and Ticket details
            var richBookings = bookings.Select(b => 
            {
                var eventObj = _context.Events.Find(e => e.Id == b.EventId).FirstOrDefault();
                var ticketType = _context.TicketTypes.Find(t => t.Id == b.TicketTypeId).FirstOrDefault();

                return new 
                {
                    Id = b.Id,
                    EventName = eventObj?.Name ?? "Unknown Event",
                    Venue = eventObj?.Location ?? "Unknown Venue",
                    Date = eventObj?.Date.ToString("d MMMM yyyy") ?? "TBA",
                    Time = eventObj?.Date.ToString("hh:mm tt") ?? "TBA",
                    Team1 = "N/A", // Placeholder as Event model might no have teams
                    Team2 = "N/A",
                    TicketType = ticketType?.Name ?? "General",
                    Price = ticketType?.Price ?? 0,
                    CustomerName = b.CustomerName,
                    CustomerEmail = b.CustomerEmail,
                    CustomerPhone = b.CustomerPhone,
                    Seat = "General Admission", // Default
                    Gate = "Main Gate", // Default
                    Block = "A", // Default
                    Status = b.Status,
                    Quantity = b.Quantity
                };
            });

            return Ok(richBookings);
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