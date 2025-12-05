using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string BookingId { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty;

        public string EventId { get; set; } = string.Empty;

        public string TicketTypeId { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public DateTime BookingDate { get; set; }

        // ✅ Add this property
        public decimal TotalAmount { get; set; }
    }
}

