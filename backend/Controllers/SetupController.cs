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
                // 1. Check Connection & Database Name
                 var dbName = _context.Users.Database.DatabaseNamespace.DatabaseName;
                 
                // 2. Check Admin
                var admin = _context.Users.Find(u => u.Name == "admin").FirstOrDefault();
                if (admin != null)
                {
                    // Reset password just in case (Force it to be admin123)
                    admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
                    admin.Role = "Admin";
                    admin.IsVerified = true;
                    _context.Users.ReplaceOne(u => u.Id == admin.Id, admin);
                    
                    return Ok(new { 
                        status = "Admin Exists", 
                        message = "✅ Password forced reset to 'admin123'", 
                        database = dbName,
                        user = new { admin.Name, admin.Email, admin.Role } 
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
