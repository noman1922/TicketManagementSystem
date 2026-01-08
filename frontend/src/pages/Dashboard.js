import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Dashboard.css";
import Footer from "../components/Footer";

// Helper for dynamic images (same as Home.js)
const getEventImage = (eventName = "") => {
  const name = eventName.toLowerCase();
  if (name.includes("football") || name.includes("cricket")) return "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg";
  if (name.includes("concert") || name.includes("rock")) return "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg";
  if (name.includes("festival")) return "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg";
  if (name.includes("tech")) return "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg";
  return "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg";
};

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleViewDetails = (eventId) => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/events/${eventId}`);
    } else {
      navigate("/login", { state: { redirect: `/events/${eventId}` } });
    }
  };

  return (
    <div className="dashboard">
      <h2>All Upcoming Events</h2>

      <div className="events-grid">
        {events.map(event => (
          <div
            className="event-card"
            key={event.id}
            onClick={() => handleViewDetails(event.id)}
          >
            <img
              src={getEventImage(event.name)}
              alt={event.name}
            />

            <div className="card-body">
              <h3>{event.name}</h3>
              <p>{event.venue}</p>
              <p className="date">
                📅 {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              <button>Get Tickets</button>
            </div>
          </div>
        ))}
      </div>

      {/* Optional: Add Footer if desired, layout allows */}
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;
