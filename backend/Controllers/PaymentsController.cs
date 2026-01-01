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

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(req.Amount * 100),
                Currency = "usd",
                Metadata = new Dictionary<string, string>
                {
                    { "bookingId", req.BookingId }
                }
            };

            var service = new PaymentIntentService();
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

                await _context.Payments.UpdateOneAsync(
                    p => p.StripePaymentIntentId == intent.Id,
                    Builders<Payment>.Update.Set(p => p.Status, "succeeded")
                );

                // TODO: update Booking status to "Confirmed"
            }

            return Ok();
        }
    }
}
