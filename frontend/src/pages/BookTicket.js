import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

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
      .then(res => setTickets(res.data));
  }, [id, navigate]);

  return (
    <div>
      <h2>Select Ticket</h2>

      {tickets.map(t => (
        <div key={t.id}>
          <p>{t.name} — ${t.price}</p>
          <button>Pay</button>
        </div>
      ))}
    </div>
  );
};

export default BookTicket;
