import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events")
      .then((res) => {
        setEvents(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>All Events</h2>

      {events.length === 0 && <p>No events available</p>}

      {events.map((event) => (
        <div
          key={event.id}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "12px",
          }}
        >
          <h3>{event.name}</h3>
          <p>{event.description}</p>
          <p><strong>Venue:</strong> {event.venue}</p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(event.date).toLocaleString()}
          </p>

          <button onClick={() => navigate(`/events/${event.id}`)}>
            View Details
          </button>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
