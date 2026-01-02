import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  const handleBuy = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { redirect: `/book/${id}` } });
    } else {
      navigate(`/book/${id}`);
    }
  };

  return (
    <div>
      <h2>{event.name}</h2>
      <p>{event.description}</p>
      <p><strong>Venue:</strong> {event.venue}</p>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(event.date).toLocaleString()}
      </p>

      <button onClick={handleBuy}>Buy Ticket</button>
    </div>
  );
};

export default Event;
