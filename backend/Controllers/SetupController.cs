using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;
using BCrypt.Net;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public SetupController(MongoDbContext context)
        {
            _context = context;
        }

        [HttpGet("seed")]
        public IActionResult SeedAdmin()
        {
            try
            {
                var dbResult = "";

                // ==========================================
                // 1. SEED SAMPLE EVENTS (Run this FIRST)
                // ==========================================
                var eventsCount = _context.Events.CountDocuments(_ => true);
                if (eventsCount == 0)
                {
                    var sampleEvents = new List<Event>
                    {
                        new Event {
                            Name = "Grand Rock Concert",
                            Date = DateTime.UtcNow.AddDays(10),
                            Location = "Dhaka Arena",
                            Description = "An electrifying night of rock music.",
                            ImageUrl = "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg", 
                            Category = "Concerts",
                            Organizer = "Rock Nation",
                            FormattedDate = DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd"),
                            FormattedTime = "19:00"
                        },
                        new Event {
                            Name = "Live Football Final",
                            Date = DateTime.UtcNow.AddDays(5),
                            Location = "National Stadium",
                            Description = "The biggest match of the year.",
                            ImageUrl = "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg",
                            Category = "Sports",
                            Organizer = "Sports Federation",
                            FormattedDate = DateTime.UtcNow.AddDays(5).ToString("yyyy-MM-dd"),
                            FormattedTime = "16:00"
                        }
                    };
                    _context.Events.InsertMany(sampleEvents);
                    dbResult = "Events Seeded + ";
                }

                // 2. Check Connection & Database Name
                 var dbName = _context.Users.Database.DatabaseNamespace.DatabaseName;
                 
                // 3. Check Admin
                var admin = _context.Users.Find(u => u.Name == "admin").FirstOrDefault();
                if (admin != null)
                {
                    // Reset password just in case (Force it to be admin123)
                    admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                    admin.Role = "Admin";
                    admin.IsVerified = true;
                    _context.Users.ReplaceOne(u => u.Id == admin.Id, admin);
                    
                    return Ok(new { 
                        status = "Success", 
                        message = dbResult + "Admin Password Reset to 'admin123'", 
                        database = dbName,
                        user = new { admin.Name, admin.Email } 
                    });
                }

                // 3. Create Admin
                var newAdmin = new User
                {
                    Name = "admin",
                    Email = "admin@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    IsVerified = true,
                    Role = "Admin"
                };
                _context.Users.InsertOne(newAdmin);

                return Ok(new { 
                    status = "Success", 
                    message = "✅ Admin Created: admin / admin123", 
                    database = dbName 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    status = "Error", 
                    message = "❌ Database Connection Failed", 
                    error = ex.Message, 
                    inner = ex.InnerException?.Message 
                });
            }
        }
    }
}
