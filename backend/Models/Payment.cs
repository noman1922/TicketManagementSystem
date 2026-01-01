using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class Payment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string? BookingId { get; set; }

        public string? StripePaymentIntentId { get; set; }

        public decimal Amount { get; set; }

        public string Currency { get; set; } = "usd";

        public string? Status { get; set; } // pending, succeeded, failed

        public DateTime CreatedAt { get; set; }
    }
}
