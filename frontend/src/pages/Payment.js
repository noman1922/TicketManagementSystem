import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../api/api";
import "./Payment.css";

const stripePromise = loadStripe("pk_test_51SktIaHcxp1nbkTaMDuICZY6xjXvKCbex0srG0XvTs7YSlfOyEz7FGEirUChVhBwghtYPV9m3ZpbjMLgX88km6ho00ezLtlbxc");

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const location = useLocation();
    const navigate = useNavigate();

    // Get data passed from Sidebar
    const { clientSecret, bookingId, amount, customerDetails } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    if (!location.state) {
        return <div className="payment-page-container"><h2>Invalid Access</h2></div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: customerDetails.name,
                        email: customerDetails.email,
                        phone: customerDetails.phone
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status === "succeeded") {
                await api.post("/payments/confirm-payment", {
                    bookingId: bookingId,
                    paymentIntentId: result.paymentIntent.id
                });
                setSuccess(true);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="payment-page-container success-view">
                <div className="success-card">
                    <h1>✅ Payment Successful!</h1>
                    <p>Amount Paid: <strong>৳ {amount}</strong></p>
                    <p>A receipt has been sent to your email.</p>
                    <button onClick={() => navigate("/events")}>Go to Events</button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page-container">
            <div className="payment-card-box">
                <h2>Secure Payment</h2>
                <div className="amount-display">
                    Total: <span>৳ {amount}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="card-input-wrapper">
                        <label>Card Information</label>
                        <div className="stripe-card-element">
                            <CardElement options={{
                                hidePostalCode: true,
                                style: {
                                    base: {
                                        fontSize: '18px',
                                        color: '#32325d',
                                        '::placeholder': { color: '#aab7c4' },
                                    },
                                    invalid: { color: '#ef4444' },
                                },
                            }} />
                        </div>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <button type="submit" className="pay-now-btn" disabled={loading || !stripe}>
                        {loading ? "Processing..." : `Pay ৳ ${amount}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Payment = () => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm />
        </Elements>
    );
};

export default Payment;
