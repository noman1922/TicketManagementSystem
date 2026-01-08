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
        
        // Customer Details
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Failed

        public int Quantity { get; set; }
        public DateTime BookingDate { get; set; }
        public decimal TotalAmount { get; set; }
    }
}