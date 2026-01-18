import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import PaymentSidebar from "../components/PaymentSidebar";
import "./Event.css";

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("categories");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Payment Stats
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    // Fetch Event Details
    api.get(`/events/${id}`)
      .then(res => {
        setEvent(res.data);
        calculateTimeLeft(res.data.date);
      })
      .catch(err => console.error(err));

    // Fetch Ticket Types
    console.log("Fetching tickets for Event ID:", id);
    api.get(`/tickettypes?eventId=${id}`)
      .then(res => {
        console.log("Tickets received:", res.data);
        console.log("First ticket object:", res.data[0]); // Log first ticket to see structure
        setTicketTypes(res.data);
      })
      .catch(err => {
        console.error("Error fetching tickets:", err);
        setTicketTypes([]);
      });
  }, [id]);

  useEffect(() => {
    if (!event) return;
    const timer = setInterval(() => calculateTimeLeft(event.date), 1000);
    return () => clearInterval(timer);
  }, [event]);

  const calculateTimeLeft = (eventDate) => {
    const difference = +new Date(eventDate) - +new Date();
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  };

  const handleBuy = (ticket) => {
    // Open Payment Sidebar
    setSelectedTicket(ticket);
    setIsPaymentOpen(true);
  };

  if (!event) return <div className="loading">Loading...</div>;

  return (
    <div className="event-page">
      {/* Payment Sidebar */}
      <PaymentSidebar
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        ticket={selectedTicket}
        event={event}
      />

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <img
          src={event.imageUrl ? `http://localhost:5208${event.imageUrl}` : "https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg"}
          alt={event.name}
          className="hero-bg"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg"; }}
        />
        <div className="hero-content">
          <div className="hero-tags">
            <span className="tag">{event.venue || "Venue"}</span>
          </div>
          <h1 className="event-title">{event.name}</h1>
          <div className="event-meta">
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span>📍 {event.venue}</span>
            <span>⏰ {new Date(event.date).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="content-left">
          {/* Countdown Timer */}
          <div className="countdown-card">
            <div className="timer-box">
              <span className="time">{timeLeft.days}</span>
              <span className="label">Days</span>
            </div>
            <div className="timer-box">
              <span className="time">{timeLeft.hours}</span>
              <span className="label">Hours</span>
            </div>
            <div className="timer-box">
              <span className="time">{timeLeft.minutes}</span>
              <span className="label">Mins</span>
            </div>
            <div className="timer-box">
              <span className="time">{timeLeft.seconds}</span>
              <span className="label">Secs</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs">
            <button
              className={activeTab === "categories" ? "active" : ""}
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </button>
            <button
              className={activeTab === "about" ? "active" : ""}
              onClick={() => setActiveTab("about")}
            >
              About The Event
            </button>
            <button
              className={activeTab === "policies" ? "active" : ""}
              onClick={() => setActiveTab("policies")}
            >
              Event Policies
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "categories" && (
              <div className="categories-section">
                <h3>Select Tickets</h3>
                {ticketTypes.length === 0 ? (
                  <p className="no-tickets">No ticket types available</p>
                ) : (
                  <div className="ticket-list">
                    {ticketTypes.map(t => {
                      const name = t.name || t.Name || 'Unnamed Category';
                      const price = t.price || t.Price || 0;
                      const available = t.availableQuantity !== undefined ? t.availableQuantity : (t.AvailableQuantity || 0);
                      const ticketId = t.id || t.Id;

                      return (
                        <div key={ticketId} className="ticket-item">
                          <div className="ticket-info">
                            <h4>{name}</h4>
                            <span className="price">৳ {price}</span>
                            <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>
                              {available > 0 ? `${available} seats left` : "SOLD OUT"}
                            </span>
                          </div>
                          <button
                            className="buy-btn"
                            onClick={() => handleBuy(t)}
                            disabled={available <= 0}
                            style={available <= 0 ? { background: '#ccc', cursor: 'not-allowed' } : {}}
                          >
                            {available > 0 ? "BUY" : "SOLD OUT"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="about-section">
                <h3>About The Event</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{event.about || event.description || "No details provided."}</p>
              </div>
            )}

            {activeTab === "policies" && (
              <div className="policies-section">
                <h3>Event Policies</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{event.policies || "No specific policies listed."}</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-right">
          {/* Organizer Info / Map Placeholder */}
          <div className="organizer-card">
            <h3>Organized by</h3>
            <p className="organizer-name">{event.organizer || "Organizer"}  </p>

          </div>

          <div className="map-card">
            <h3>Location</h3>
            <p>{event.venue}</p>

            <div className="map-container">
              <iframe
                title="Event Location"
                width="100%"
                height="250"
                style={{ border: 0, borderRadius: "8px" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(event.venue)}&output=embed`}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Event;
