// 📁 Models/Booking.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;  // Only this Id, no BookingId
        
        public string UserId { get; set; } = string.Empty;    // Stores User's Id
        public string EventId { get; set; } = string.Empty;   // Stores Event's Id
        public string TicketTypeId { get; set; } = string.Empty; // Stores TicketType's Id
        public int Quantity { get; set; }
        public DateTime BookingDate { get; set; }
        public decimal TotalAmount { get; set; }
    }
}