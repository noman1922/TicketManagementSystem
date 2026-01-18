import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./PaymentSidebar.css";

const PaymentSidebar = ({ isOpen, onClose, ticket, event }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
    const [quantity, setQuantity] = useState(1); // ✅ Quantity state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const amount = ticket.price * quantity;

            // 1. Create Booking
            const bookingRes = await api.post("/bookings", {
                eventId: event.id,
                ticketTypeId: ticket.id,
                quantity: quantity,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email
            });

            const bookingId = bookingRes.data.id;

            // 2. Check if free ticket (price = 0)
            if (amount === 0) {
                // Free ticket - confirm booking directly without payment
                await api.post("/payments/confirm-payment", {
                    bookingId: bookingId
                });

                alert("✅ Free ticket claimed successfully! Check your profile.");
                onClose();
                navigate("/profile");
                return;
            }

            // 3. For paid tickets - Create Payment Intent
            const intentRes = await api.post("/payments/create-intent", {
                bookingId: bookingId,
                amount: amount
            });

            const clientSecret = intentRes.data.clientSecret;

            // 4. Navigate to Payment Page
            navigate("/payment", {
                state: {
                    clientSecret,
                    bookingId,
                    amount,
                    customerDetails: formData
                }
            });

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || "Something went wrong";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !ticket) return null;

    return (
        <div className="payment-sidebar-overlay">
            <div className={`payment-sidebar ${isOpen ? "open" : ""}`}>
                <div className="payment-sidebar-content">
                    <div className="sidebar-header">
                        <h3>Checkout</h3>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>

                    <div className="order-summary">
                        <h4>{event.name}</h4>
                        <p>{ticket.name}</p>

                        {/* Quantity Selector */}
                        <div className="quantity-selector" style={{ margin: '15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label>Quantity (Max 4):</label>
                            <select
                                className="ticket-quantity-select"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}

                            >
                                <option value={1}>1 Ticket</option>
                                <option value={2}>2 Tickets</option>
                                <option value={3}>3 Tickets</option>
                                <option value={4}>4 Tickets</option>
                            </select>
                        </div>

                        <div className="total-price" style={{ marginTop: '10px', fontSize: '1.2em', fontWeight: 'bold', color: '#3b82f6' }}>
                            Total: ৳ {(ticket.price * quantity).toLocaleString()}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1234567890"
                            />
                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <button type="submit" className="pay-btn" disabled={loading}>
                            {loading ? "Processing..." :
                                ticket.price === 0 ? "CLAIM FREE TICKET" :
                                    `Pay ৳ ${(ticket.price * quantity).toLocaleString()}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentSidebar;
