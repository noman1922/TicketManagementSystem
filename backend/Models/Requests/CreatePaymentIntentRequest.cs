namespace TicketManagementSystemMongo.Models.Requests
{
    public class CreatePaymentIntentRequest
    {
        public string BookingId { get; set; } = null!;
        public decimal Amount { get; set; }
    }
}
