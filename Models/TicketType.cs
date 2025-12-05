using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class TicketType
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]   // ✅ store as string
        public string? TicketTypeId { get; set; }
        public string? EventId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public int AvailableQuantity { get; set; }
    }
}