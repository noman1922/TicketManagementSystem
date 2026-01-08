import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Profile.css";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("passes");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const ticketRef = useRef(null); // Ref for the printable ticket

    // Demo Ticket Data
    const demoTicket = {
        id: "33999253-BD42-4D29-B6E3-5D5017CEE96E",
        eventName: "AFC Asian Cup Saudi Arabia 2027 Qualifiers",
        team1: "BANGLADESH",
        team2: "HONG KONG, CHINA",
        date: "9 October 2025",
        time: "08:00 PM",
        gateOpen: "3:00 PM",
        venue: "National Stadium Dhaka",
        seat: "F-09",
        block: "M",
        zone: "Upper West",
        gate: "4",
        stadiumGate: "11–14",
        price: "৳ 150",
        user: "Noman",
        email: "mdnomanahamed22@gmail.com",
        phone: "8801400019228"
    };

    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const downloadTicketPDF = async () => {
        setIsGeneratingPDF(true);

        // Wait for the modal to render
        await new Promise(resolve => setTimeout(resolve, 100));

        const input = ticketRef.current;
        if (!input) {
            alert("Ticket template not found!");
            setIsGeneratingPDF(false);
            return;
        }

        try {
            // Wait for images to load
            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#f2f2f2",
                logging: true
            });

            const imgData = canvas.toDataURL("image/png");

            // Create PDF
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            // Calculate dimensions to fit A4
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

            // Save with proper filename
            const filename = `Ticket-${demoTicket.id.substring(0, 8)}.pdf`;
            pdf.save(filename);

            console.log("PDF generated successfully!");
            setIsGeneratingPDF(false);
        } catch (err) {
            console.error("PDF Generation Error:", err);
            alert(`Error generating PDF: ${err.message}`);
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* HEADER */}


                {/* USER INFO */}
                <div className="user-section">
                    <div className="avatar-large">N</div>
                    <h2 className="user-name">Noman Khan</h2>
                    <p className="user-email">mdnomanahamed22@gmail.com</p>
                </div>

                {/* STATS */}
                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-value">7</span>
                        <span className="stat-label">Passes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">0</span>
                        <span className="stat-label">Bookings</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">3</span>
                        <span className="stat-label">Orders</span>
                    </div>
                </div>

                {/* TABS */}
                <div className="profile-tabs">
                    {["Passes", "Bookings", "Orders", "Addons", "Transfer", "Addresses"].map((tab) => (
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
                            {/* TICKET CARD (List View) */}
                            <div className="ticket-card-list">
                                <div className="ticket-header">
                                    {/* Using demoTicket data for consistency in list view too */}
                                    <h3>{demoTicket.eventName}</h3>
                                    <span className="ticket-status">Active</span>
                                </div>

                                <div className="ticket-body-mini">
                                    <p><strong>Date:</strong> {demoTicket.date} • {demoTicket.time}</p>
                                    <p><strong>Seat:</strong> Block {demoTicket.block}, Seat {demoTicket.seat}</p>
                                </div>

                                <div className="ticket-actions">
                                    <button
                                        className="view-btn"
                                        onClick={() => setSelectedTicket(demoTicket)}
                                    >
                                        👁 View Ticket
                                    </button>
                                    <button
                                        className="download-btn-outline"
                                        onClick={downloadTicketPDF}
                                    >
                                        ⬇ Download
                                    </button>
                                </div>
                            </div>
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

                        {/* Using the same printable design for the modal visual or a simplified one? 
                User said "follow this design". Let's use the new design inside the modal too if it fits,
                or keep the premium modal. For now, keeping premium modal for "View" as it's mobile friendly, 
                and the "Download" gives the full A4 style. 
            */}

                        {/* PREMIUM VISUAL (Restored) */}
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
                                        <p>{selectedTicket.user}</p>
                                    </div>
                                    <div>
                                        <label>Price</label>
                                        <p>{selectedTicket.price}</p>
                                    </div>
                                </div>

                                <div className="qr-section">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedTicket.id}`}
                                        alt="QR Code"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="download-btn-full" onClick={downloadTicketPDF}>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PRINTABLE TICKET - Shows as modal when generating PDF */}
            {isGeneratingPDF && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.8)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px"
                }}>
                    <div style={{
                        background: "#f2f2f2",
                        borderRadius: "8px",
                        maxHeight: "90vh",
                        overflow: "auto"
                    }}>
                        <div ref={ticketRef} className="print-page-container">
                            <div className="print-ticket">

                                {/* HEADER */}
                                <div className="print-header">
                                    <h1>{demoTicket.eventName}</h1>
                                    <div className="print-match">
                                        <div className="print-team">{demoTicket.team1}</div>
                                        <div className="print-vs">VS</div>
                                        <div className="print-team">{demoTicket.team2}</div>
                                    </div>
                                    <div className="print-details">
                                        <div>
                                            Venue: {demoTicket.venue}<br />
                                            Date: {demoTicket.date}
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            Gate Opens: {demoTicket.gateOpen}<br />
                                            Match Time: {demoTicket.time}
                                        </div>
                                    </div>
                                </div>

                                {/* RULES */}
                                <div className="print-rules">
                                    Tickets remain the property of AFC. Entry is permitted only with a valid ticket.
                                    Tickets are non-refundable and non-transferable. Prohibited items are strictly
                                    forbidden. AFC reserves the right to modify seating or scheduling.
                                </div>

                                {/* SPONSORS */}
                                <div className="print-sponsors">
                                    <strong>PRESENTED BY TECNO</strong><br />
                                    Partners: UCB · Radiant · Molten · Dhaka Bank
                                </div>

                                {/* INFO BOXES */}
                                <div className="print-info-boxes">
                                    <div className="print-box">Zone<strong>{demoTicket.zone}</strong></div>
                                    <div className="print-box">Outer Gate<strong>{demoTicket.gate}</strong></div>
                                    <div className="print-box">Stadium Gate<strong>{demoTicket.stadiumGate}</strong></div>
                                    <div className="print-box">Block<strong>{demoTicket.block}</strong></div>
                                    <div className="print-box">Seat<strong>{demoTicket.seat}</strong></div>
                                </div>

                                {/* BOTTOM */}
                                <div className="print-bottom">
                                    <div className="print-user-info">
                                        <p><strong>Name:</strong> {demoTicket.user} | 1</p>
                                        <p><strong>Email:</strong> {demoTicket.email}</p>
                                        <p><strong>Phone:</strong> {demoTicket.phone}</p>
                                        <p><strong>Ticket ID:</strong> {demoTicket.id}</p>
                                    </div>
                                    <div className="print-qr-box">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${demoTicket.id}`}
                                            alt="QR"
                                            style={{ width: '130px', height: '130px' }}
                                        />
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="print-footer">
                                    Ticketing with TICKET BROKER<br />
                                    Do not share your QR code or ticket ID.
                                </div>

                            </div>
                        </div>
                    </div>
                    <div style={{
                        position: "absolute",
                        top: "20px",
                        color: "white",
                        fontSize: "14px"
                    }}>
                        Generating PDF...
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;
