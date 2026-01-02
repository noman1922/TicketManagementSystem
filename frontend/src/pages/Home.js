import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Home.css";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>Discover & Book Amazing Events</h1>
          <p>Concerts • Festivals • Shows • Experiences</p>

          <input
            className="search-input"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* EVENTS */}
      <section className="events-section">
        <h2>Upcoming Events</h2>

        <div className="events-grid">
          {filtered.map(event => (
            <div className="event-card" key={event.id}>
              <div className="event-image">
                <img
                  src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg"
                  alt="event"
                />
                <span className="event-date">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>

              <div className="event-content">
                <h3>{event.name}</h3>
                <p className="venue">{event.venue}</p>
                <p className="desc">{event.description}</p>

                <button onClick={() => navigate(`/events/${event.id}`)}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
