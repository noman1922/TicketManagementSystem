namespace TicketManagementSystemMongo.Models
{
    public class DashboardViewModel
    {
        public long TotalUsers { get; set; }
        public long TotalEvents { get; set; }
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
