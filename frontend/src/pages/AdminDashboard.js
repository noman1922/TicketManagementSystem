import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventForm, setEventForm] = useState({
        name: "",
        date: "",
        location: "",
        description: "",
        imageUrl: ""
    });

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        if (activeView === "events") loadEvents();
        if (activeView === "users") loadUsers();
        if (activeView === "bookings") loadBookings();
    }, [activeView]);

    const loadStats = () => {
        api.get("/admin/dashboard")
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    };

    const loadEvents = () => {
        api.get("/events")
            .then(res => setEvents(res.data))
            .catch(err => console.error(err));
    };

    const loadUsers = () => {
        api.get("/admin/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const loadBookings = () => {
        api.get("/admin/all-bookings")
            .then(res => setBookings(res.data))
            .catch(err => console.error(err));
    };

    const handleAddEvent = () => {
        setEditingEvent(null);
        setEventForm({
            name: "",
            date: "",
            location: "",
            description: "",
            imageUrl: ""
        });
        setShowEventModal(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setEventForm({
            name: event.name,
            date: event.date.split('T')[0], // Format for input type="date"
            location: event.location,
            description: event.description || "",
            imageUrl: event.imageUrl || ""
        });
        setShowEventModal(true);
    };

    const handleDeleteEvent = (eventId) => {
        console.log("Delete button clicked for event ID:", eventId);

        const confirmDelete = window.confirm(
            "⚠️ Confirm Delete\n\n" +
            "Are you sure you want to delete this event?\n\n" +
            "This action cannot be undone and will:\n" +
            "• Remove the event from the database\n" +
            "• Delete all associated data\n\n" +
            "Click OK to DELETE or Cancel to keep the event."
        );

        console.log("User confirmed delete:", confirmDelete);

        if (!confirmDelete) {
            console.log("Delete cancelled by user");
            return;
        }

        console.log("Sending DELETE request to:", `/events/${eventId}`);

        api.delete(`/events/${eventId}`)
            .then((response) => {
                console.log("Delete successful, response:", response);
                alert("✅ Event deleted successfully!");
                loadEvents();
                loadStats();
            })
            .catch(err => {
                console.error("Delete error details:", {
                    message: err.message,
                    response: err.response,
                    status: err.response?.status,
                    data: err.response?.data
                });
                alert(`❌ Failed to delete event\n\nError: ${err.response?.data || err.message}`);
            });
    };

    const handleSubmitEvent = (e) => {
        e.preventDefault();

        const eventData = {
            ...eventForm,
            date: new Date(eventForm.date).toISOString()
        };

        const request = editingEvent
            ? api.put(`/events/${editingEvent.id}`, eventData)
            : api.post("/events", eventData);

        request
            .then(() => {
                alert(editingEvent ? "Event updated successfully!" : "Event added successfully!");
                setShowEventModal(false);
                loadEvents();
                loadStats();
            })
            .catch(err => {
                console.error(err);
                alert("Failed to save event");
            });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (!stats) return <div className="loading">Loading Admin Dashboard...</div>;

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>🎟 Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={activeView === "dashboard" ? "active" : ""}
                        onClick={() => setActiveView("dashboard")}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className={activeView === "events" ? "active" : ""}
                        onClick={() => setActiveView("events")}
                    >
                        🎫 Events
                    </button>
                    <button
                        className={activeView === "users" ? "active" : ""}
                        onClick={() => setActiveView("users")}
                    >
                        👥 Users
                    </button>
                    <button
                        className={activeView === "bookings" ? "active" : ""}
                        onClick={() => setActiveView("bookings")}
                    >
                        📋 Bookings
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                {/* Dashboard View */}
                {activeView === "dashboard" && (
                    <div className="dashboard-view">
                        <h1>Dashboard Overview</h1>
                        <div className="stats-grid">
                            <div className="stat-card users" onClick={() => setActiveView("users")}>
                                <h3>Total Users</h3>
                                <p className="stat-number">{stats.totalUsers}</p>
                            </div>
                            <div className="stat-card events" onClick={() => setActiveView("events")}>
                                <h3>Total Events</h3>
                                <p className="stat-number">{stats.totalEvents}</p>
                            </div>
                            <div className="stat-card bookings" onClick={() => setActiveView("bookings")}>
                                <h3>Total Bookings</h3>
                                <p className="stat-number">{stats.totalBookings}</p>
                            </div>
                            <div className="stat-card revenue">
                                <h3>Total Revenue</h3>
                                <p className="stat-number">৳ {stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Events View */}
                {activeView === "events" && (
                    <div className="events-view">
                        <div className="view-header">
                            <h1>Events Management</h1>
                            <button className="btn-primary" onClick={handleAddEvent}>
                                ➕ Add New Event
                            </button>
                        </div>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Location</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map(event => (
                                        <tr key={event.id}>
                                            <td>
                                                <img
                                                    src={event.imageUrl || "/placeholder.png"}
                                                    alt={event.name}
                                                    className="event-thumb"
                                                />
                                            </td>
                                            <td>{event.name}</td>
                                            <td>{new Date(event.date).toLocaleDateString()}</td>
                                            <td>{event.location}</td>
                                            <td className="actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEditEvent(event)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users View */}
                {activeView === "users" && (
                    <div className="users-view">
                        <h1>Users List</h1>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Registered</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                                            <td>
                                                <span className={`badge ${user.isVerified ? 'verified' : 'pending'}`}>
                                                    {user.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>{new Date(user.registeredDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Bookings View */}
                {activeView === "bookings" && (
                    <div className="bookings-view">
                        <h1>Bookings List</h1>
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Event</th>
                                        <th>Ticket Type</th>
                                        <th>Quantity</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>
                                                <div>{booking.customerName}</div>
                                                <small>{booking.customerEmail}</small>
                                            </td>
                                            <td>{booking.eventName}</td>
                                            <td>{booking.ticketType}</td>
                                            <td>{booking.quantity}</td>
                                            <td>৳ {booking.totalAmount.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${booking.status.toLowerCase()}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td>{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
                    <div className="modal-content event-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingEvent ? "Edit Event" : "Add New Event"}</h2>
                            <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmitEvent} className="event-form">
                            <div className="form-group">
                                <label>Event Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={eventForm.name}
                                    onChange={e => setEventForm({ ...eventForm, name: e.target.value })}
                                    placeholder="Enter event name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={eventForm.date}
                                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={eventForm.location}
                                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                                    placeholder="Enter location"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={eventForm.description}
                                    onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                    placeholder="Enter event description"
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    value={eventForm.imageUrl}
                                    onChange={e => setEventForm({ ...eventForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowEventModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingEvent ? "Update Event" : "Create Event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
