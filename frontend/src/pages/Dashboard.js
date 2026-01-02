import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard">
      <h2>All Events</h2>

      <div className="events-grid">
        {events.map(event => (
          <div className="event-card" key={event.id}>
            <img
              src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg"
              alt="event"
            />

            <div className="card-body">
              <h3>{event.name}</h3>
              <p>{event.venue}</p>
              <p className="date">
                {new Date(event.date).toLocaleString()}
              </p>

              <button onClick={() => navigate(`/events/${event.id}`)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
