using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using Stripe;
using System.IO;
using TicketManagementSystemMongo.Data;
using TicketManagementSystemMongo.Models;
using TicketManagementSystemMongo.Models.Requests;

namespace TicketManagementSystemMongo.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;

        public PaymentsController(
            MongoDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // 🔹 CREATE STRIPE PAYMENT INTENT
        [HttpPost("create-intent")]
        public IActionResult CreateIntent(
            [FromBody] CreatePaymentIntentRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.BookingId))
                return BadRequest("BookingId is required");

            if (req.Amount <= 0)
                return BadRequest("Amount must be greater than zero");

            var secretKey = _configuration["Stripe:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Contains("placeholder"))
            {
                return StatusCode(500, new { error = "Stripe SecretKey is not configured. Please add your sk_test_... key to appsettings.json" });
            }

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(req.Amount * 100),
                Currency = "bdt",
                Metadata = new Dictionary<string, string>
                {
                    { "bookingId", req.BookingId }
                }
            };

            var service = new PaymentIntentService();
            try
            {
                var intent = service.Create(options);
                
                var payment = new Payment
                {
                    BookingId = req.BookingId,
                    StripePaymentIntentId = intent.Id,
                    Amount = req.Amount,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Payments.InsertOne(payment);

                return Ok(new
                {
                    clientSecret = intent.ClientSecret
                });
            }
            catch (StripeException e)
            {
                return BadRequest(new { error = e.StripeError.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error: " + ex.Message });
            }
        }

        // 🔹 STRIPE WEBHOOK (NO AUTH)
        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            Console.WriteLine("🔔 Stripe webhook HIT");

            var json = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"];

            var stripeEvent = EventUtility.ConstructEvent(
                json,
                signature,
                _configuration["Stripe:WebhookSecret"]
            );

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var intent = (PaymentIntent)stripeEvent.Data.Object;

                // 1. Update Payment Status
                var paymentUpdate = Builders<Payment>.Update.Set(p => p.Status, "succeeded");
                var payment = await _context.Payments.FindOneAndUpdateAsync(
                    p => p.StripePaymentIntentId == intent.Id,
                    paymentUpdate,
                    new FindOneAndUpdateOptions<Payment> { ReturnDocument = ReturnDocument.After }
                );

                if (payment != null)
                {
                    // 2. Update Booking Status
                    var bookingUpdate = Builders<Booking>.Update.Set(b => b.Status, "Confirmed");
                    var booking = await _context.Bookings.FindOneAndUpdateAsync(
                        b => b.Id == payment.BookingId,
                        bookingUpdate,
                        new FindOneAndUpdateOptions<Booking> { ReturnDocument = ReturnDocument.After }
                    );

                    if (booking != null)
                    {
                        Console.WriteLine($"✅ Booking {booking.Id} Confirmed!");

                        // 3. Send Email Receipt
                        var eventDetails = _context.Events.Find(e => e.Id == booking.EventId).FirstOrDefault();
                        var ticketType = _context.TicketTypes.Find(t => t.Id == booking.TicketTypeId).FirstOrDefault();

                        var emailService = new TicketManagementSystemMongo.Services.EmailService(_configuration);
                        emailService.SendReceipt(booking, eventDetails, ticketType);
                    }
                }
            }

            return Ok();
        }
        // 🔹 CONFIRM PAYMENT & SEND RECEIPT
        [HttpPost("confirm-payment")]
        public IActionResult ConfirmPayment([FromBody] ConfirmPaymentRequest req)
        {
            var booking = _context.Bookings.Find(b => b.Id == req.BookingId).FirstOrDefault();
            if (booking == null) return NotFound("Booking not found");

            // Update Booking Status
            var update = Builders<Booking>.Update.Set(b => b.Status, "Confirmed");
            _context.Bookings.UpdateOne(b => b.Id == req.BookingId, update);

            // Fetch details for receipt
            var eventDetails = _context.Events.Find(e => e.Id == booking.EventId).FirstOrDefault();
            var ticketType = _context.TicketTypes.Find(t => t.Id == booking.TicketTypeId).FirstOrDefault();

            // Send Email Receipt
            var emailService = new TicketManagementSystemMongo.Services.EmailService(_configuration);
            emailService.SendReceipt(booking, eventDetails, ticketType);

            return Ok(new { message = "Payment confirmed and receipt sent" });
        }

        public class ConfirmPaymentRequest
        {
            public string? BookingId { get; set; }
            public string? PaymentIntentId { get; set; }
        }
    }
}
