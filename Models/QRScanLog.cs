// 📁 Models/QRScanLog.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models
{
    public class QRScanLog
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]  // ✅ Use MongoDB ObjectId
        public string? Id { get; set; }          // ✅ Name it just "Id"
        
        public string? BookingId { get; set; }
        public DateTime ScanTime { get; set; }
        public string? ScannedBy { get; set; }
        public bool IsValid { get; set; }
    }
}