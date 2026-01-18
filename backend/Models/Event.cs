using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class Event
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }   // ✅ Use this as EventId
        
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public string? Venue { get; set; }
        public string Location { get; set; } = null!;
        public string? ImageUrl { get; set; } // ✅ Restored ImageUrl
        
        // New Fields for Rich Details
        public string? About { get; set; }
        public string? Policies { get; set; }
        public string? Organizer { get; set; } // Who is organizing the event
    }
}