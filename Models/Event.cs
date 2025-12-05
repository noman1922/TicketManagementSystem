using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Event
{
    [BsonId] 
    public ObjectId Id { get; set; }   // MongoDB internal _id

    [BsonRepresentation(BsonType.String)]
    public string? EventId { get; set; }   // Your GUID string

    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime Date { get; set; }
    public string? Venue { get; set; }
}
