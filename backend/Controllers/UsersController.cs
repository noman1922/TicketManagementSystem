using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using TicketManagementSystemMongo.Services;
using TicketManagementSystemMongo.Models.Requests;
using Microsoft.AspNetCore.Authorization; // ✅ Add Authorize

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _config;

        public UsersController(MongoDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // GET: /api/users
        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Users.Find(_ => true).ToList();
            return Ok(users);
        }

        // GET: /api/users/{id}
        [HttpGet("{id}")]
        public IActionResult GetUser(string id)
        {
            var user = _context.Users.Find(u => u.Id == id).FirstOrDefault();
            if (user == null) return NotFound();
            return Ok(user);
        }

        // DELETE: /api/users/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteUser(string id)
        {
            var result = _context.Users.DeleteOne(u => u.Id == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }

        // POST: /api/users/register
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            // Check if email already exists
            var existingUser = _context.Users.Find(u => u.Email == request.Email).FirstOrDefault();
            if (existingUser != null)
            {
                return BadRequest("Email already registered.");
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsVerified = true // ✅ Auto-Verify (Email optional)
            };

            // Generate 6-digit code
            // var code = new Random().Next(100000, 999999).ToString();
            // user.VerificationCode = code;
            user.VerificationCode = null; // ✅ No Verification Code needed

            _context.Users.InsertOne(user);

            // Send verification email
            // var emailService = new EmailService(_config);
            // emailService.SendVerificationEmail(user.Email, code);

            return Ok("Account created successfully (Verification skipped).");
        }

        // POST: /api/users/register-staff
        [HttpPost("register-staff")]
        [Authorize(Roles = "Admin")] // ✅ Only Admin can create Staff
        public IActionResult RegisterStaff([FromBody] RegisterRequest request)
        {
            var existingUser = _context.Users.Find(u => u.Email == request.Email).FirstOrDefault();
            if (existingUser != null)
            {
                return BadRequest("Email already registered.");
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsVerified = true, // ✅ Auto-verify staff
                Role = "Staff"     // ✅ Force Staff role
            };

            _context.Users.InsertOne(user);

            return Ok("Staff account created successfully.");
        }

        // POST: /api/users/verify
        [HttpPost("verify")]
        public IActionResult Verify([FromBody] VerifyRequest payload)
        {
            var user = _context.Users.Find(u => u.Email == payload.Email).FirstOrDefault();
            if (user == null) return NotFound("User not found.");
            if (user.VerificationCode != payload.Code) return BadRequest("Invalid code.");

            user.IsVerified = true;
            user.VerificationCode = null;
            
            _context.Users.ReplaceOne(u => u.Id == user.Id, user);

            return Ok("Account verified successfully.");
        }

        // POST: /api/users/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest payload)
        {
            // Allow login by Email OR Name
            var user = _context.Users.Find(u => u.Email == payload.Email || u.Name == payload.Email).FirstOrDefault();

            if (user == null) return NotFound("User not found.");
            
            // Allow Admin to skip verification (or ensure seeded admin is verified)
            if (user.Role != "Admin" && !user.IsVerified) return BadRequest("Account not verified.");
            
            if (!BCrypt.Net.BCrypt.Verify(payload.Password, user.PasswordHash)) 
                return BadRequest("Invalid password.");

            // Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _config["Jwt:Key"] 
                ?? throw new InvalidOperationException("JWT Key not configured in appsettings.json");

            var key = Encoding.UTF8.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),  // ✅ Fixed null check
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role) // ✅ Add Role
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            return Ok(new
            {
                Token = jwt,
                User = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    user.Role // ✅ Return Role
                }
            });

        }
    }

    // DTOs
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class VerifyRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}