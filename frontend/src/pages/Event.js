import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Event.css";

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => console.error(err));
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
    <div className="event-page">
      <img
        className="event-banner"
        src="https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg"
        alt="event"
      />

      <div className="event-content">
        <h2>{event.name}</h2>
        <p className="meta">
          📍 {event.venue} | 📅 {new Date(event.date).toLocaleString()}
        </p>
        <p>{event.description}</p>

        <button onClick={handleBuy}>Buy Ticket</button>
      </div>
    </div>
  );
};

export default Event;
