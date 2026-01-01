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
    }
}
