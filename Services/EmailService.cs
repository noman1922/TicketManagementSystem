// 📁 Services/EmailService.cs
namespace TicketManagementSystemMongo.Services
{
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
    }
}