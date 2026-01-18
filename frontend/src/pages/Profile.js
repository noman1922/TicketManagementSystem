import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../api/api";
import "./Profile.css";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("passes");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [bookings, setBookings] = useState([]); // ✅ Store real bookings
    const [user, setUser] = useState({});
    const ticketRef = useRef(null);

    // ✅ Fetch Data on Load
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(storedUser);

        // Fetch My Bookings
        api.get("/bookings/my-bookings")
            .then(res => {
                // Sort by ID descending (newest first) to handle "TBA" dates gracefully
                const sorted = [...res.data].sort((a, b) => {
                    if (a.id && b.id) {
                        return b.id.localeCompare(a.id);
                    }
                    return 0;
                });
                setBookings(sorted);
            })
            .catch(err => console.error("Failed to fetch bookings:", err));
    }, []);

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const downloadTicketPDF = async (ticket) => {
        // ... (PDF logic remains mostly the same, but use 'ticket' arg or 'selectedTicket')
        // We will adapt the existing function or just set state to trigger the hidden render
        setSelectedTicket(ticket); // Ensure data is set for the hidden view
        setIsGeneratingPDF(true);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render

        const input = ticketRef.current;
        if (!input) {
            setIsGeneratingPDF(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Wait for images

            // ✅ COMPRESSION: Use scale 1.5 instead of 2 (slightly lower res but good enough for print)
            const canvas = await html2canvas(input, { scale: 1.5, useCORS: true, backgroundColor: "#e2e8f0" });

            // ✅ COMPRESSION: Use JPEG with 0.7 quality instead of PNG (Huge size reduction)
            const imgData = canvas.toDataURL("image/jpeg", 0.7);

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight); // Use JPEG here too
            pdf.save(`Ticket-${ticket.id.substring(0, 8)}.pdf`);

        } catch (err) {
            console.error(err);
            alert("PDF Error: " + err.message);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="profile-page fade-in">
            <div className="profile-container">
                {/* USER INFO */}
                <div className="user-section">
                    <div className="avatar-large">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
                    <h2 className="user-name">{user.name || "Guest User"}</h2>
                    <p className="user-email">{user.email || "No Email"}</p>
                </div>

                {/* STATS */}
                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-value">{bookings.length}</span>
                        <span className="stat-label">Passes</span>
                    </div>
                </div>

                {/* TABS */}
                <div className="profile-tabs">
                    {["Passes", "Receipts"].map((tab) => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab.toLowerCase() ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="tab-content">
                    {activeTab === "passes" ? (
                        <div className="passes-list">
                            {bookings.length === 0 ? (
                                <p className="no-data">No bookings found.</p>
                            ) : (
                                bookings.map(booking => (
                                    <div key={booking.id} className="ticket-card-list slide-in-up">
                                        <div className="ticket-header">
                                            <h3>{booking.eventName}</h3>
                                            <span
                                                className={`ticket-status ${booking.status?.toLowerCase()}`}
                                                style={{
                                                    background: booking.status === "Used" ? "#fee2e2" : "#dcfce7",
                                                    color: booking.status === "Used" ? "#991b1b" : "#166534"
                                                }}
                                            >
                                                {booking.status === "Used" ? "Invalid" : "Valid"}
                                            </span>
                                        </div>

                                        <div className="ticket-body-mini">
                                            <p><strong>Date:</strong> {booking.date} • {booking.time}</p>
                                            <p><strong>Seat:</strong> {booking.seat}</p>
                                            <p><strong>Qty:</strong> {booking.quantity} Ticket(s)</p>
                                        </div>

                                        <div className="ticket-actions">
                                            {booking.status !== "Used" && (
                                                <button
                                                    className="view-btn"
                                                    onClick={() => setSelectedTicket(booking)}
                                                >
                                                    👁 View Ticket
                                                </button>
                                            )}
                                            <button
                                                className="download-btn-outline"
                                                onClick={() => downloadTicketPDF(booking)}
                                            >
                                                ⬇ Download
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : activeTab === "receipts" ? (
                        <div className="receipts-list">
                            {bookings.length === 0 ? (
                                <p className="no-data">No receipts found.</p>
                            ) : (
                                bookings.map(booking => (
                                    <div key={booking.id} className="receipt-card fade-in" style={{
                                        border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '15px', background: '#fff'
                                    }}>
                                        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: 0, color: '#0f172a' }}>RECEIPT</h4>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{new Date().toLocaleDateString()}</span>
                                        </div>

                                        <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Event:</span>
                                                <strong>{booking.eventName}</strong>
                                            </p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>To:</span>
                                                <span>{booking.customerEmail}</span>
                                            </p>
                                            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Item:</span>
                                                <span>{booking.ticketType} x {booking.quantity}</span>
                                            </p>
                                            <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                                                <span>Total Paid:</span>
                                                <span>৳ {booking.price * booking.quantity}</span>
                                            </div>
                                            <div style={{ marginTop: '5px', textAlign: 'right', fontSize: '12px', color: 'green' }}>
                                                ● Paid via Card
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No {activeTab} found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* TICKET MODAL */}
            {selectedTicket && (
                <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="modal-content ticket-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Digital Ticket</h3>
                            <button className="close-btn" onClick={() => setSelectedTicket(null)}>×</button>
                        </div>

                        <div className="ticket-visual">
                            <div className="ticket-top">
                                <span className="brand-small">Ticket Broker</span>
                                <h2>{selectedTicket.eventName}</h2>
                                <div className="ticket-meta">
                                    <div>
                                        <label>Date</label>
                                        <p>{selectedTicket.date}</p>
                                    </div>
                                    <div>
                                        <label>Time</label>
                                        <p>{selectedTicket.time}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="ticket-divider">
                                <div className="circle-left"></div>
                                <div className="dashed-line"></div>
                                <div className="circle-right"></div>
                            </div>

                            <div className="ticket-bottom">
                                <div className="ticket-details-grid">
                                    <div>
                                        <label>Venue</label>
                                        <p>{selectedTicket.venue}</p>
                                    </div>
                                    <div>
                                        <label>Seat</label>
                                        <p>{selectedTicket.seat}</p>
                                    </div>
                                    <div>
                                        <label>User</label>
                                        <p>{selectedTicket.customerName}</p>
                                    </div>
                                    <div>
                                        <label>Price</label>
                                        <p>৳ {selectedTicket.price}</p>
                                    </div>
                                    <div>
                                        <label>Quantity</label>
                                        <p>{selectedTicket.quantity}</p>
                                    </div>
                                </div>

                                <div className="qr-section">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.id}`}
                                        alt="QR Code"
                                    />
                                    <p style={{ marginTop: '5px', fontSize: '0.8em' }}>ID: {selectedTicket.id.substring(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="download-btn-full" onClick={() => downloadTicketPDF(selectedTicket)}>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINTABLE TICKET - Hidden unless generating PDF */}
            {isGeneratingPDF && selectedTicket && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, opacity: 0, pointerEvents: 'none' }}>
                    <div ref={ticketRef} className="print-page-container" style={{ width: '800px', background: '#f2f2f2', padding: '20px' }}>
                        <div className="print-ticket">
                            <div className="print-header">
                                <h1>{selectedTicket.eventName}</h1>
                                <div className="print-match">
                                    {/* Mock Teams if not available */}
                                    <div className="print-team">{selectedTicket.team1 || "Event"}</div>
                                    <div className="print-vs">VS</div>
                                    <div className="print-team">{selectedTicket.team2 || "Highlights"}</div>
                                </div>
                                <div className="print-details">
                                    <div>
                                        Venue: {selectedTicket.venue}<br />
                                        Date: {selectedTicket.date}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        Time: {selectedTicket.time}
                                    </div>
                                </div>
                            </div>

                            <div className="print-info-boxes">
                                <div className="print-box">Block<strong>{selectedTicket.block || "A"}</strong></div>
                                <div className="print-box">Seat<strong>{selectedTicket.seat || "GA"}</strong></div>
                                <div className="print-box">Qty<strong>{selectedTicket.quantity}</strong></div>
                            </div>

                            <div className="print-bottom">
                                <div className="print-user-info">
                                    <p><strong>Name:</strong> {selectedTicket.customerName}</p>
                                    <p><strong>Email:</strong> {selectedTicket.customerEmail}</p>
                                    <p><strong>ID:</strong> {selectedTicket.id}</p>
                                </div>
                                <div className="print-qr-box">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${selectedTicket.id}`}
                                        alt="QR"
                                        style={{ width: '130px', height: '130px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;
