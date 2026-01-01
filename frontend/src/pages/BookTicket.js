import { useParams } from "react-router-dom";
import { apiRequest } from "../api/api";
import { useState } from "react";

export default function BookTicket() {
  const { eventId } = useParams();
  const [quantity, setQuantity] = useState(1);

  const book = async () => {
    const token = localStorage.getItem("token");

    const booking = await apiRequest(
      "/bookings",
      "POST",
      { eventId, quantity },
      token
    );

    await apiRequest(
      "/payments/create-intent",
      "POST",
      { bookingId: booking.id },
      token
    );

    alert("Booking created. PaymentIntent started.");
  };

  return (
    <div>
      <h2>Book Ticket</h2>
      <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
      <button onClick={book}>Book & Pay</button>
    </div>
  );
}
