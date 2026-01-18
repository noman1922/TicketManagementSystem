using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;
using TicketManagementSystemMongo.Models;

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
            string subject = "Verify your account - Ticket System";
            string body = $"Your verification code is: <b>{verificationCode}</b>";
            SendEmail(toEmail, subject, body);
        }

        public void SendReceipt(Booking booking, Event eventDetails, TicketType ticketType)
        {
            string subject = $"Payment Receipt - {eventDetails?.Name}";
             string body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;'>
                    <h2 style='color: #3b82f6;'>Payment Receipt</h2>
                    <p>Hi <strong>{booking.CustomerName}</strong>,</p>
                    <p>Thank you for your purchase!</p>
                    
                    <table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>
                        <tr style='background: #f8f9fa;'>
                            <td style='padding: 10px;'><strong>Event</strong></td>
                            <td style='padding: 10px;'>{eventDetails?.Name}</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px;'><strong>Date</strong></td>
                            <td style='padding: 10px;'>{eventDetails?.Date:f}</td>
                        </tr>
                        <tr style='background: #f8f9fa;'>
                            <td style='padding: 10px;'><strong>Ticket</strong></td>
                            <td style='padding: 10px;'>{ticketType?.Name} x {booking.Quantity}</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px;'><strong>Total Paid</strong></td>
                            <td style='padding: 10px; font-weight: bold;'>৳ {booking.TotalAmount}</td>
                        </tr>
                        <tr style='background: #f8f9fa;'>
                            <td style='padding: 10px;'><strong>Status</strong></td>
                            <td style='padding: 10px; color: green;'>Confirmed</td>
                        </tr>
                    </table>

                    <p style='margin-top: 20px;'>Your QR Code/Ticket is now available in your profile.</p>
                </div>
            ";

            SendEmail(booking.CustomerEmail, subject, body);
        }

        private void SendEmail(string toEmail, string subject, string body)
        {
            // 1. Capture Config Values (Main Thread)
            var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var port = int.TryParse(_configuration["EmailSettings:Port"], out int p) ? p : 587;
            var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "";
            var senderPassword = _configuration["EmailSettings:SenderPassword"] ?? "";

            // 2. Run in Background (Fire-and-Forget)
            Task.Run(async () =>
            {
                try
                {
                    if (string.IsNullOrEmpty(senderEmail) || senderEmail.Contains("your-email"))
                    {
                        Console.WriteLine("⚠️ SMTP credentials not set. Email skipped.");
                        return;
                    }

                    var message = new MimeMessage();
                    message.From.Add(new MailboxAddress("Ticket System", senderEmail));
                    message.To.Add(new MailboxAddress("", toEmail));
                    message.Subject = subject;

                    var builder = new BodyBuilder { HtmlBody = body };
                    message.Body = builder.ToMessageBody();

                    using (var client = new SmtpClient())
                    {
                        // Accept all SSL certificates (in case of weird Render cert issues)
                        client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                        await client.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls);
                        await client.AuthenticateAsync(senderEmail, senderPassword);
                        await client.SendAsync(message);
                        await client.DisconnectAsync(true);
                    }

                    Console.WriteLine($"✅ Email sent to {toEmail} via MailKit");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Failed to send email: {ex.Message}");
                }
            });
        }
    }
}