import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./BookTicket.css";

const BookTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    api.get(`/tickettypes?eventId=${id}`)
      .then(res => setTickets(res.data))
      .catch(() => setTickets([]));
  }, [id, navigate]);

  return (
    <div className="book-page">
      <h2>Select Ticket</h2>

      {tickets.length === 0 && <p>No ticket types available</p>}

      {tickets.map(t => (
        <div className="ticket-card" key={t.id}>
          <h3>{t.name}</h3>
          <p>Price: ${t.price}</p>
          <button>Proceed to Payment</button>
        </div>
      ))}
    </div>
  );
};

export default BookTicket;
