import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Home.css";
import Footer from "../components/Footer";


/* ✅ IMAGE HELPER FUNCTION */
const getEventImage = (eventName = "") => {
  const name = eventName.toLowerCase();

  if (name.includes("football") || name.includes("cricket")) {
    return "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg";
  }

  if (name.includes("concert") || name.includes("rock")) {
    return "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg";
  }

  if (name.includes("festival")) {
    return "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg";
  }

  if (name.includes("tech")) {
    return "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg";
  }

  // fallback image
  return "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg";
};

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data))
      .catch(() => setEvents([]));
  }, []);

  // Filter Logic
  const filteredEvents = events.filter(event => {
    if (selectedCategory === "All") return true;

    const name = event.name.toLowerCase();
    if (selectedCategory === "Concerts") return name.includes("concert") || name.includes("rock") || name.includes("music") || name.includes("live");
    if (selectedCategory === "Sports") return name.includes("football") || name.includes("cricket") || name.includes("sport") || name.includes("match");
    if (selectedCategory === "Festivals") return name.includes("festival") || name.includes("party") || name.includes("carnival");
    if (selectedCategory === "Arts") return name.includes("art") || name.includes("theatre") || name.includes("drama") || name.includes("exhibition");

    return false;
  });

  return (
    <div className="cinema-home">

      {/* HERO */}
      <section className="cinema-hero fade-in-down">
        <div className="hero-left">
          <span className="hero-badge">Live events happening now</span>

          <h1>
            BOOK TICKETS FOR THE <span>BIGGEST EVENTS</span>
          </h1>

          <p>
            Sports, concerts, festivals and unforgettable live experiences —
            all in one place.
          </p>

          <button onClick={() => navigate("/events")} className="btn-animate">
            Explore Events
          </button>
        </div>

        <div className="hero-right slide-in-right">
          <img src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg" alt="" />
          <img src="https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg" alt="" />
          <img src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg" alt="" />
          <img src="https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg" alt="" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="cinema-categories">
        {["All", "Concerts", "Sports", "Festivals", "Arts"].map((cat) => (
          <div
            key={cat}
            className={`stagger-item ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "All" ? "🔥 All" :
              cat === "Concerts" ? "🎵 Concerts" :
                cat === "Sports" ? "🏆 Sports" :
                  cat === "Festivals" ? "🎉 Festivals" :
                    "🎭 Arts"}
          </div>
        ))}
      </section>

      {/* EVENTS */}
      <section className="cinema-events">
        <div className="events-header">
          <h2>Upcoming Events</h2>
          <span onClick={() => navigate("/events")}>View all</span>
        </div>

        <div className="events-grid">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className="cinema-card scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => {
                const token = localStorage.getItem("token");
                if (token) {
                  navigate(`/events/${event.id}`);
                } else {
                  navigate("/login", { state: { redirect: `/events/${event.id}` } });
                }
              }}
            >
              {/* ✅ DYNAMIC IMAGE (Fixed for Production) */}
              <img
                src={event.imageUrl
                  ? (event.imageUrl.startsWith("http") ? event.imageUrl : `${api.defaults.baseURL.replace("/api", "")}${event.imageUrl}`)
                  : getEventImage(event.name)}
                alt={event.name}
              />

              <div className="card-info">
                <h3>{event.name}</h3>
                <p>{event.venue}</p>
                <span>{new Date(event.date).toDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
