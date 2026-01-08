
namespace TicketManagementSystemMongo.Services
{
    using TicketManagementSystemMongo.Models;

    public class EmailService
    {
        private readonly IConfiguration _configuration;
        
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        
        public void SendVerificationEmail(string toEmail, string verificationCode)
        {
            // Simple console output for now
            Console.WriteLine($"=================================");
            Console.WriteLine($"EMAIL VERIFICATION:");
            Console.WriteLine($"To: {toEmail}");
            Console.WriteLine($"Code: {verificationCode}");
            Console.WriteLine($"=================================");
            
            // In production, add real email sending code here
        }

        public void SendReceipt(Booking booking, Event eventDetails, TicketType ticketType)
        {
            Console.WriteLine($"\n=================================");
            Console.WriteLine($"🧾 PAYMENT RECEIPT - QUICKET");
            Console.WriteLine($"=================================");
            Console.WriteLine($"To: {booking.CustomerEmail}");
            Console.WriteLine($"Name: {booking.CustomerName}");
            Console.WriteLine($"Event: {eventDetails?.Name}");
            Console.WriteLine($"Date: {eventDetails?.Date}");
            Console.WriteLine($"Ticket: {ticketType?.Name} x {booking.Quantity}");
            Console.WriteLine($"Total: ${booking.TotalAmount}");
            Console.WriteLine($"Status: {booking.Status}");
            Console.WriteLine($"=================================\n");
        }
    }
}