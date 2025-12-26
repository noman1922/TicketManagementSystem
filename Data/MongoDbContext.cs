// 📁 Data/MongoDbContext.cs
using MongoDB.Driver;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration config)
        {
            // Debug: Show what we're connecting to
            var connectionString = config["MongoDBSettings:ConnectionString"];
            var databaseName = config["MongoDBSettings:DatabaseName"];
            
            Console.WriteLine($"=== MONGODB CONNECTION ===");
            Console.WriteLine($"Connection String: {connectionString?.Substring(0, Math.Min(50, connectionString.Length))}...");
            Console.WriteLine($"Database Name: {databaseName}");
            
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            
            Console.WriteLine($"Connected to database: {_database.DatabaseNamespace.DatabaseName}");
        }

        // Your collections...
        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
        public IMongoCollection<Event> Events => _database.GetCollection<Event>("Events");
        public IMongoCollection<TicketType> TicketTypes => _database.GetCollection<TicketType>("TicketTypes");
        public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("Bookings");
        public IMongoCollection<QRScanLog> QRScanLogs => _database.GetCollection<QRScanLog>("QRScanLogs");
    }
}