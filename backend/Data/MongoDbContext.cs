using MongoDB.Driver;
using TicketManagementSystemMongo.Models;

namespace TicketManagementSystemMongo.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var client = new MongoClient(
                configuration["MongoDbSettings:ConnectionString"]
            );

            _database = client.GetDatabase(
                configuration["MongoDbSettings:DatabaseName"]
            );
        }

        public IMongoCollection<User> Users =>
            _database.GetCollection<User>("Users");

        public IMongoCollection<Event> Events =>
            _database.GetCollection<Event>("Events");

        public IMongoCollection<TicketType> TicketTypes =>
            _database.GetCollection<TicketType>("TicketTypes");

        public IMongoCollection<Booking> Bookings =>
            _database.GetCollection<Booking>("Bookings");

        public IMongoCollection<QRScanLog> QRScanLogs =>
            _database.GetCollection<QRScanLog>("QRScanLogs");

        // ✅ THIS LINE FIXES YOUR PAYMENTS ERROR
        public IMongoCollection<Payment> Payments =>
            _database.GetCollection<Payment>("Payments");
    }
}
