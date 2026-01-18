using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // Base route: /api/admin
    public class AdminController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public AdminController(MongoDbContext context)
        {
            _context = context;
        }

        // GET: /api/admin/dashboard
        [HttpGet("dashboard")]
        public IActionResult GetDashboard()
        {
            var usersCount = _context.Users.CountDocuments(_ => true);
            var eventsCount = _context.Events.CountDocuments(_ => true);
            var bookings = _context.Bookings.Find(_ => true).ToList();

            // ✅ Calculate total revenue dynamically
            decimal totalRevenue = 0;
            foreach (var booking in bookings)
            {
                var ticketType = _context.TicketTypes.Find(t => t.Id == booking.TicketTypeId).FirstOrDefault();
                if (ticketType != null)
                {
                    totalRevenue += ticketType.Price * booking.Quantity;
                }
            }

            var dashboard = new
            {
                TotalUsers = usersCount,
                TotalEvents = eventsCount,
                TotalBookings = bookings.Count,
                TotalRevenue = totalRevenue
            };

            return Ok(dashboard);
        }

        // GET: /api/admin/users
        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.Find(_ => true).SortByDescending(u => u.Id).ToList();
            var userList = users.Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role,
                u.IsVerified,
                RegisteredDate = u.Id != null ? MongoDB.Bson.ObjectId.Parse(u.Id).CreationTime : DateTime.MinValue
            });
            return Ok(userList);
        }

        // GET: /api/admin/all-bookings
        [HttpGet("all-bookings")]
        public IActionResult GetAllBookings()
        {
            var bookings = _context.Bookings.Find(_ => true).SortByDescending(b => b.BookingDate).ToList();
            
            var enrichedBookings = bookings.Select(b =>
            {
                var eventObj = _context.Events.Find(e => e.Id == b.EventId).FirstOrDefault();
                var ticketType = _context.TicketTypes.Find(t => t.Id == b.TicketTypeId).FirstOrDefault();

                return new
                {
                    b.Id,
                    b.CustomerName,
                    b.CustomerEmail,
                    b.CustomerPhone,
                    EventName = eventObj?.Name ?? "Unknown",
                    TicketType = ticketType?.Name ?? "General",
                    b.Quantity,
                    b.TotalAmount,
                    b.Status,
                    b.BookingDate
                };
            });

            return Ok(enrichedBookings);
        }
        // GET: /api/admin/event-stats/{eventId}
        [HttpGet("event-stats/{eventId}")]
        public IActionResult GetEventStats(string eventId)
        {
            var eventObj = _context.Events.Find(e => e.Id == eventId).FirstOrDefault();
            if (eventObj == null) return NotFound("Event not found");

            var ticketTypes = _context.TicketTypes.Find(t => t.EventId == eventId).ToList();
            var bookings = _context.Bookings.Find(b => b.EventId == eventId).ToList();

            var stats = ticketTypes.Select(tt =>
            {
                var soldCount = bookings
                    .Where(b => b.TicketTypeId == tt.Id)
                    .Sum(b => b.Quantity);

                return new
                {
                    Category = tt.Name,
                    Price = tt.Price,
                    Available = tt.AvailableQuantity,
                    Sold = soldCount,
                    Revenue = soldCount * tt.Price
                };
            }).ToList();

            var totalStats = new
            {
                EventName = eventObj.Name,
                TotalRevenue = stats.Sum(s => s.Revenue),
                TotalSold = stats.Sum(s => s.Sold),
                CategoryStats = stats
            };

            return Ok(totalStats);
        }
    }
}
