import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./PaymentSidebar.css";

const PaymentSidebar = ({ isOpen, onClose, ticket, event }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create Booking (Pending)
            const bookingRes = await api.post("/bookings", {
                eventId: event.id,
                ticketTypeId: ticket.id,
                quantity: 1,
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email
            });

            const bookingId = bookingRes.data.id;
            const amount = ticket.price;

            // 2. Create Payment Intent
            const intentRes = await api.post("/payments/create-intent", {
                bookingId: bookingId,
                amount: amount
            });

            const clientSecret = intentRes.data.clientSecret;

            // 3. Navigate to Payment Page with details
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
            setError(err.message || "Something went wrong");
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
                        <p>{ticket.name} - <strong>৳ {ticket.price}</strong></p>
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
                            {loading ? "Processing..." : "Process Payment"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentSidebar;
