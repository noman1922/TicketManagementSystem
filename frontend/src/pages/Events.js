import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { Link } from "react-router-dom";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    apiRequest("/events").then(setEvents);
  }, []);

  return (
    <div>
      <h2>Events</h2>
      {events.map(e => (
        <div key={e.id}>
          <h3>{e.name}</h3>
          <p>{e.venue}</p>
          <Link to={`/book/${e.id}`}>Book</Link>
        </div>
      ))}
    </div>
  );
}
