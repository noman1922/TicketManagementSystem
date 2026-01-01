using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Event
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }   // ✅ Use this as EventId
    
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public string? Venue { get; set; }
}