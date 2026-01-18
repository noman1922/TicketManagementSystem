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
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffForm, setStaffForm] = useState({ name: "", email: "", password: "" });
    const [editingEvent, setEditingEvent] = useState(null);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsData, setStatsData] = useState(null);

    // ✅ NEW: Extended Event Form State
    const [eventForm, setEventForm] = useState({
        name: "",
        date: "",
        location: "",
        description: "",
        about: "",
        policies: "",
        organizer: "",
    });
    const [imageFile, setImageFile] = useState(null); // Local file
    const [ticketTypes, setTicketTypes] = useState([{ name: "Standard", price: 0, quantity: 100 }]); // Default ticket type

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
            .then(res => {
                const sortedEvents = res.data.sort((a, b) => b.id.localeCompare(a.id));
                setEvents(sortedEvents);
            })
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
            about: "",
            policies: "",
            organizer: "",
        });
        setImageFile(null);
        setTicketTypes([{ name: "Standard", price: 0, quantity: 100 }]);
        setShowEventModal(true);
    };

    const handleEditEvent = async (event) => {
        setEditingEvent(event);
        setEventForm({
            name: event.name,
            date: event.date.split('T')[0],
            location: event.location,
            description: event.description || "",
            about: event.about || "",
            policies: event.policies || "",
            organizer: event.organizer || "",
        });
        setImageFile(null); // User can optionally upload new image

        // Fetch existing ticket types for this event
        try {
            const res = await api.get(`/tickettypes?eventId=${event.id}`);
            const existingTicketTypes = res.data.map(tt => ({
                name: tt.name || tt.Name || "",
                price: tt.price || tt.Price || 0,
                quantity: tt.availableQuantity || tt.AvailableQuantity || 0
            }));
            setTicketTypes(existingTicketTypes.length > 0 ? existingTicketTypes : [{ name: "Standard", price: 0, quantity: 100 }]);
        } catch (err) {
            console.error("Failed to load ticket types:", err);
            setTicketTypes([{ name: "Standard", price: 0, quantity: 100 }]);
        }

        setShowEventModal(true);
    };

    const handleDeleteEvent = (eventId) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        api.delete(`/events/${eventId}`)
            .then(() => {
                alert("✅ Event deleted successfully!");
                loadEvents();
                loadStats();
            })
            .catch(err => alert("Failed to delete: " + (err.response?.data || err.message)));
    };

    // ✅ NEW: Dynamic Ticket Types Handlers
    const handleTicketTypeChange = (index, field, value) => {
        const updated = [...ticketTypes];
        updated[index][field] = value;
        setTicketTypes(updated);
    };

    const addTicketTypeRow = () => {
        setTicketTypes([...ticketTypes, { name: "", price: 0, quantity: 0 }]);
    };

    const removeTicketTypeRow = (index) => {
        if (ticketTypes.length > 1) {
            const updated = ticketTypes.filter((_, i) => i !== index);
            setTicketTypes(updated);
        }
    };

    const handleSubmitEvent = async (e) => {
        e.preventDefault();

        // Use FormData for File Upload
        const formData = new FormData();
        formData.append("name", eventForm.name);
        formData.append("date", new Date(eventForm.date).toISOString());
        formData.append("location", eventForm.location);
        formData.append("description", eventForm.description);
        formData.append("about", eventForm.about);
        formData.append("policies", eventForm.policies);
        formData.append("organizer", eventForm.organizer);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        // Serialize Ticket Types with PascalCase property names for backend
        const ticketTypesForBackend = ticketTypes.map(tt => ({
            Name: tt.name,
            Price: tt.price,
            Quantity: tt.quantity
        }));
        formData.append("ticketTypesJson", JSON.stringify(ticketTypesForBackend));

        try {
            if (editingEvent) {
                // Update existing event
                await api.put(`/events/${editingEvent.id}`, formData);
                alert("✅ Event updated successfully!");
            } else {
                // Create new event
                await api.post("/events", formData);
                alert("✅ Event created successfully!");
            }
            setShowEventModal(false);
            loadEvents();
            loadStats();
        } catch (err) {
            console.error("Full error:", err);
            console.error("Error response:", err.response);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || "Unknown error";
            alert("❌ Failed to save event: " + JSON.stringify(errorMsg));
        }
    };

    // ✅ Handle Add Staff
    const handleAddStaff = () => {
        setStaffForm({ name: "", email: "", password: "" });
        setShowStaffModal(true);
    };

    const handleSubmitStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users/register-staff", staffForm);
            alert("✅ Staff member created successfully!");
            setShowStaffModal(false);
            loadUsers(); // Refresh user list
        } catch (err) {
            console.error(err);
            alert("❌ Failed to create staff: " + (err.response?.data || err.message));
        }
    };

    const handleViewStats = (eventId) => {
        setStatsData(null); // Reset
        setShowStatsModal(true);

        api.get(`/admin/event-stats/${eventId}`)
            .then(res => {
                setStatsData(res.data);
            })
            .catch(err => {
                console.error("Failed to load stats:", err);
                alert("Failed to load statistics: " + err.message);
                setShowStatsModal(false);
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
                        <span className="nav-icon">📊</span> <span className="nav-label">Dashboard</span>
                    </button>
                    <button
                        className={activeView === "events" ? "active" : ""}
                        onClick={() => setActiveView("events")}
                    >
                        <span className="nav-icon">🎫</span> <span className="nav-label">Events</span>
                    </button>
                    <button
                        className={activeView === "users" ? "active" : ""}
                        onClick={() => setActiveView("users")}
                    >
                        <span className="nav-icon">👥</span> <span className="nav-label">Users</span>
                    </button>
                    <button
                        className={activeView === "bookings" ? "active" : ""}
                        onClick={() => setActiveView("bookings")}
                    >
                        <span className="nav-icon">📋</span> <span className="nav-label">Bookings</span>
                    </button>

                    <button className="logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span> <span className="nav-label">Logout</span>
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

                        {/* QUICK ACTIONS */}
                        <div className="quick-actions" style={{ marginTop: '40px' }}>
                            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#1e293b' }}>Quick Actions</h2>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <button className="btn-primary" onClick={handleAddEvent} style={{ padding: '15px 25px', fontSize: '16px' }}>
                                    ➕ Add New Event
                                </button>
                                <button className="btn-primary" onClick={handleAddStaff} style={{ padding: '15px 25px', fontSize: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                                    ➕ Add Staff Member
                                </button>
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
                                                    src={event.imageUrl ? `http://localhost:5208${event.imageUrl}` : "/placeholder.png"}
                                                    alt={event.name}
                                                    className="event-thumb"
                                                />
                                            </td>
                                            <td>{event.name}</td>
                                            <td>{new Date(event.date).toLocaleDateString()}</td>
                                            <td>{event.location}</td>
                                            <td className="actions">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleViewStats(event.id)}
                                                    style={{ background: '#3b82f6', color: 'white', marginRight: '5px' }}
                                                >
                                                    📊 Stats
                                                </button>
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
                        <div className="view-header">
                            <h1>Users List</h1>
                            <button className="btn-primary" onClick={handleAddStaff}>
                                ➕ Add Staff Member
                            </button>
                        </div>
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
            {
                showEventModal && (
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
                                    <label>Event Organizer *</label>
                                    <input
                                        type="text"
                                        required
                                        value={eventForm.organizer}
                                        onChange={e =>
                                            setEventForm({ ...eventForm, organizer: e.target.value })
                                        }
                                        placeholder="Organizer name or organization"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Short Description</label>
                                    <textarea
                                        value={eventForm.description}
                                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                                        placeholder="Brief summary for card view"
                                        rows="2"
                                    />
                                </div>

                                {/* NEW: Rich Details */}
                                <div className="form-group">
                                    <label>About The Event</label>
                                    <textarea
                                        value={eventForm.about}
                                        onChange={e => setEventForm({ ...eventForm, about: e.target.value })}
                                        placeholder="Detailed event information..."
                                        rows="4"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Event Policies</label>
                                    <textarea
                                        value={eventForm.policies}
                                        onChange={e => setEventForm({ ...eventForm, policies: e.target.value })}
                                        placeholder="Refund policy, age restrictions, etc."
                                        rows="3"
                                    />
                                </div>

                                {/* NEW: File Upload */}
                                <div className="form-group">
                                    <label>Event Banner Image (Upload Local File)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files[0])}
                                    />
                                </div>

                                {/* NEW: Ticket Types */}
                                <div className="form-group">
                                    <label>Ticket Categories</label>
                                    <div className="ticket-types-container">
                                        {ticketTypes.map((type, index) => (
                                            <div key={index} className="ticket-type-row">
                                                <input
                                                    type="text"
                                                    placeholder="Category (e.g. VIP)"
                                                    value={type.name}
                                                    onChange={e => handleTicketTypeChange(index, "name", e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={type.price}
                                                    onChange={e => handleTicketTypeChange(index, "price", parseFloat(e.target.value))}
                                                    required
                                                    min="0"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Seats"
                                                    value={type.quantity}
                                                    onChange={e => handleTicketTypeChange(index, "quantity", parseInt(e.target.value))}
                                                    required
                                                    min="1"
                                                />
                                                {ticketTypes.length > 1 && (
                                                    <button type="button" className="btn-remove" onClick={() => removeTicketTypeRow(index)}>×</button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" className="btn-add-row" onClick={addTicketTypeRow}>
                                            + Add Category
                                        </button>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowEventModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingEvent ? "Update Event (Limited)" : "Create Event"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Staff Modal */}
            {
                showStaffModal && (
                    <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
                        <div className="modal-content staff-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Add New Staff Member</h2>
                                <button className="close-btn" onClick={() => setShowStaffModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleSubmitStaff} className="staff-form">
                                <div className="form-group">
                                    <label>Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={staffForm.name}
                                        onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                        placeholder="Staff Name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={staffForm.email}
                                        onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                        placeholder="staff@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={staffForm.password}
                                        onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                                        placeholder="Initial Password"
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowStaffModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Create Staff
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Stats Modal */}
            {
                showStatsModal && statsData && (
                    <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
                        <div className="modal-content stats-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h2>📊 Event Statistics</h2>
                                <button className="close-btn" onClick={() => setShowStatsModal(false)}>×</button>
                            </div>

                            <div className="stats-body" style={{ padding: '20px' }}>
                                <h3 style={{ marginBottom: '20px', color: '#64748b' }}>{statsData.eventName}</h3>

                                <div className="stats-summary" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                    <div className="stat-box" style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                        <div style={{ color: '#0369a1', fontSize: '14px' }}>Total Revenue</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>৳ {statsData.totalRevenue.toLocaleString()}</div>
                                    </div>
                                    <div className="stat-box" style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                        <div style={{ color: '#15803d', fontSize: '14px' }}>Tickets Sold</div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{statsData.totalSold}</div>
                                    </div>
                                </div>

                                <h4 style={{ marginBottom: '10px' }}>Category Breakdown</h4>
                                <table className="admin-table" style={{ fontSize: '14px' }}>
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Sold</th>
                                            <th>Available</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statsData.categoryStats.map((cat, idx) => (
                                            <tr key={idx}>
                                                <td>{cat.category || cat.Category || 'N/A'}</td>
                                                <td>৳{cat.price || cat.Price || 0}</td>
                                                <td>{cat.sold || cat.Sold || 0}</td>
                                                <td>{cat.available || cat.Available || 0}</td>
                                                <td>৳{((cat.revenue || cat.Revenue) || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowStatsModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
