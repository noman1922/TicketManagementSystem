using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;


namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]   // Base route: /api/users
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
            var user = _context.Users.Find(u => u.UserId == id).FirstOrDefault();
            if (user == null) return NotFound();
            return Ok(user);
        }

        // DELETE: /api/users/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteUser(string id)
        {
            var result = _context.Users.DeleteOne(u => u.UserId == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }

        // POST: /api/users/register
        [HttpPost("register")]
        public IActionResult Register([FromBody] User user)
        {
            user.UserId = Guid.NewGuid().ToString();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash); // hash password
            user.IsVerified = false;

            // generate 6-digit code
            var code = new Random().Next(100000, 999999).ToString();
            user.VerificationCode = code;

            _context.Users.InsertOne(user);

            // TODO: send email with code (SMTP/SendGrid)
            // EmailService.Send(user.Email, "Your verification code is " + code);

            return Ok("Verification code sent to email.");
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
            _context.Users.ReplaceOne(u => u.UserId == user.UserId, user);

            return Ok("Account verified successfully.");
        }

        // POST: /api/users/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest payload)
        {
            var user = _context.Users.Find(u => u.Email == payload.Email).FirstOrDefault();
            if (user == null) return NotFound("User not found.");
            if (!user.IsVerified) return BadRequest("Account not verified.");
            if (!BCrypt.Net.BCrypt.Verify(payload.Password, user.PasswordHash)) return BadRequest("Invalid password.");

            // ✅ Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _config["Jwt:Key"] 
            ?? throw new InvalidOperationException("JWT Key not configured in appsettings.json");

            var key = Encoding.UTF8.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, "User")
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"]
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            return Ok(new { Token = jwt, Message = "Login successful" });
        }
    }

    // ✅ DTOs for cleaner request handling
    public class VerifyRequest
    {
        public string? Email { get; set; }
        public string? Code { get; set; }
    }

    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}
