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
        
        // POST: /api/qrscan/scan
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
            
            // 2. Check if already scanned
            var existingScan = _context.QRScanLogs
                .Find(s => s.BookingId == request.BookingId && s.IsValid)
                .FirstOrDefault();
            
            if (existingScan != null)
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
                return BadRequest("Ticket already scanned.");
            }
            
            // 3. Log successful scan
            var scanLog = new QRScanLog
            {
                BookingId = request.BookingId ?? string.Empty,
                ScanTime = DateTime.UtcNow,
                ScannedBy = request.ScannerId,
                IsValid = true
            };
            _context.QRScanLogs.InsertOne(scanLog);
            
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