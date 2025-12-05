using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TicketManagementSystemMongo.Models

{
    public class QRScanLog
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]   // ✅ store as string
        public string? ScanLogId { get; set; }
        public string? BookingId { get; set; }
        public DateTime ScanTime { get; set; }
        public string? ScannedBy { get; set; } // EmployeeId who scanned
        public bool IsValid { get; set; }
    }
}