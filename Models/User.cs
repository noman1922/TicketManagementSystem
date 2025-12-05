namespace TicketManagementSystemMongo.Models
{
    public class User
    {
        public string Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsVerified { get; set; } = false;
        public string? VerificationCode { get; set; }
    }
}
