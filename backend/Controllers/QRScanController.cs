// 📁 Controllers/QRScanController.cs
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QRScanController : ControllerBase
    {
        private readonly MongoDbContext _context;
        
        public QRScanController(MongoDbContext context)
        {
            _context = context;
        }
        
        // POST: /api/qrscan/check (VIEW ONLY)
        [HttpPost("check")]
        public IActionResult CheckQR([FromBody] ScanRequest request)
        {
            var bookingId = request?.BookingId?.Trim();
            Console.WriteLine($"[CheckQR] Received: '{bookingId}'");

            if (string.IsNullOrEmpty(bookingId))
                return BadRequest("Booking ID is required.");

            // 1. Find Booking
            var booking = _context.Bookings.Find(b => b.Id == bookingId).FirstOrDefault();
            
            if (booking == null)
            {
                Console.WriteLine($"[CheckQR] Booking not found for ID: '{bookingId}'");
                return NotFound("Invalid ticket ID (Not found in DB).");
            }

            // 2. Return Booking Info (No modification)
            return Ok(new 
            { 
                Success = true, 
                Booking = booking 
            });
        }

        // POST: /api/qrscan/scan (VALIDATE/REDEEM)
        [HttpPost("scan")]
        public IActionResult ScanQR([FromBody] ScanRequest request)
        {
            if (string.IsNullOrEmpty(request?.BookingId))
                return BadRequest("Booking ID is required.");
            
            // 1. Check if booking exists
            var booking = _context.Bookings.Find(b => b.Id == request.BookingId).FirstOrDefault();
            if (booking == null)
            {
                // Log failed scan
                var failedLog = new QRScanLog
                {
                    // Use Id, not ScanLogId
                    BookingId = request.BookingId ?? string.Empty,
                    ScanTime = DateTime.UtcNow,
                    ScannedBy = request.ScannerId,
                    IsValid = false
                };
                _context.QRScanLogs.InsertOne(failedLog);
                return BadRequest("Invalid booking ID.");
            }
            
            // 2. Check if already scanned OR Status is "Used"
            var existingScan = _context.QRScanLogs
                .Find(s => s.BookingId == request.BookingId && s.IsValid)
                .FirstOrDefault();
            
            if (existingScan != null || booking.Status == "Used")
            {
                // Log duplicate scan attempt
                var duplicateLog = new QRScanLog
                {
                    BookingId = request.BookingId ?? string.Empty,
                    ScanTime = DateTime.UtcNow,
                    ScannedBy = request.ScannerId,
                    IsValid = false
                };
                _context.QRScanLogs.InsertOne(duplicateLog);
                return BadRequest("Ticket already scanned / Used.");
            }
            
            // 3. Log successful scan AND Update Booking Status
            var scanLog = new QRScanLog
            {
                BookingId = request.BookingId ?? string.Empty,
                ScanTime = DateTime.UtcNow,
                ScannedBy = request.ScannerId,
                IsValid = true
            };
            _context.QRScanLogs.InsertOne(scanLog);

            // ✅ UPDATE STATUS TO "USED"
            var update = Builders<Booking>.Update.Set(b => b.Status, "Used");
            _context.Bookings.UpdateOne(b => b.Id == request.BookingId, update);
            
            return Ok(new 
            { 
                Success = true, 
                Message = "Ticket scanned successfully.",
                Booking = booking 
            });
        }
        
        // GET: /api/qrscan/logs
        [HttpGet("logs")]
        public IActionResult GetScanLogs()
        {
            var logs = _context.QRScanLogs.Find(_ => true).ToList();
            return Ok(logs);
        }
        
        // GET: /api/qrscan/logs/{bookingId}
        [HttpGet("logs/{bookingId}")]
        public IActionResult GetScanLogsByBooking(string bookingId)
        {
            var logs = _context.QRScanLogs.Find(s => s.BookingId == bookingId).ToList();
            return Ok(logs);
        }
    }
    
    public class ScanRequest
    {
        public string? BookingId { get; set; }
        public string? ScannerId { get; set; }
    }
}