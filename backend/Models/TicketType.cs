// 📁 Models/TicketType.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class TicketType
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;  // Should be Id, not TicketTypeId
        
        public string EventId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int AvailableQuantity { get; set; }
    }
}