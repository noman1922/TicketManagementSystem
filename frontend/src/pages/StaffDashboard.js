import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./StaffDashboard.css"; // Import the new CSS file

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [scannedId, setScannedId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Real Camera Scan with html5-qrcode
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let scanner = null;
        if (isScanning) {
            import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
                scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scanner.render(onScanSuccess, onScanFailure);
            });
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            }
        };
        // eslint-disable-next-line
    }, [isScanning]);

    const onScanSuccess = (decodedText, decodedResult) => {
        // Stop scanning after success
        setIsScanning(false);
        setBookingId(decodedText);
        checkTicket(decodedText);
    };

    const onScanFailure = (error) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const handleCameraScan = () => {
        setIsScanning(true);
    };

    const handleManualScan = (e) => {
        e.preventDefault();
        checkTicket(bookingId);
    };

    const checkTicket = async (codeInput) => {
        const code = codeInput?.trim();
        if (!code) return;

        setLoading(true);
        setError("");
        setScanResult(null);
        setScannedId(null);

        try {
            const response = await api.post("/qrscan/check", { bookingId: code });
            setScanResult(response.data);
            setScannedId(code);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || "Scan failed. Invalid ticket.";
            setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setLoading(false);
        }
    };

    const validateTicket = async () => {
        if (!scannedId) return;
        setLoading(true);

        try {
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : {};

            const payload = {
                bookingId: scannedId,
                scannerId: user.id || "unknown_staff"
            };

            const response = await api.post("/qrscan/scan", payload);

            // Update UI to show it's now used
            const updatedBooking = { ...scanResult.booking, status: "Used" };
            setScanResult({ ...response.data, booking: updatedBooking });

            // Play success sound
            const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clank_car_crash.ogg");
            audio.play().catch(() => { });

            alert("✅ Ticket marked as INVALID / USED");

        } catch (err) {
            console.error(err);
            setError(err.response?.data || "Validation failed.");
        } finally {
            setLoading(false);
        }
    };



    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="dashboard-container fade-in">
            <div className="dashboard-header">
                <h2>Staff Dashboard</h2>

            </div>

            <div className="dashboard-stats scanner-layout">
                <div className="stat-card scanner-card">
                    <h3>QR Ticket Scanner</h3>

                    <div className="scanner-actions">

                        {/* CAMERA SCANNER AREA */}
                        {isScanning ? (
                            <div className="scanner-wrapper fade-in">
                                <div id="reader"></div>
                                <button
                                    className="btn-secondary stop-btn"
                                    onClick={() => setIsScanning(false)}
                                >
                                    ❌ Stop Camera
                                </button>
                            </div>
                        ) : (
                            <button className="btn-primary start-scan-btn" onClick={() => setIsScanning(true)}>
                                📷 Scan with Camera
                            </button>
                        )}

                        <div className="manual-divider">or enter code manually</div>

                        <form onSubmit={handleManualScan} className="manual-scan-form">
                            <input
                                type="text"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                placeholder="Enter Booking ID"
                                className="manual-input"
                            />
                            <button type="submit" className="btn-secondary" disabled={loading}>
                                {loading ? "Verifying..." : "Check Ticket"}
                            </button>
                        </form>
                    </div>

                    {/* Results Display */}
                    {error && (
                        <div className="error-msg shake">
                            ❌ {error}
                        </div>
                    )}

                    {scanResult && (
                        <div className="success-msg scale-in">
                            <div className="ticket-status-badge">
                                <span className={scanResult.booking?.status === 'Used' ? 'status-used' : 'status-valid'}>
                                    {scanResult.booking?.status === 'Used' ? '⚠️ ALREADY USED' : '✅ VALID TICKET'}
                                </span>
                            </div>

                            <div className="ticket-details">
                                <p><strong>Event:</strong> {scanResult.booking?.eventName || "Event Details Loaded"}</p>
                                <p><strong>Customer:</strong> {scanResult.booking?.customerName}</p>
                                <p><strong>Ticket Type:</strong> {scanResult.booking?.ticketType || "Standard"}</p>
                                <p><strong>Quantity:</strong> {scanResult.booking?.quantity}</p>
                                <p className="ticket-id">ID: {scanResult.booking?.id}</p>
                            </div>

                            {/* VALIDATE ACTION */}
                            {scanResult.booking?.status !== 'Used' && (
                                <button
                                    className="btn-primary invalidate-btn"
                                    onClick={validateTicket}
                                    disabled={loading}
                                >
                                    🔴 MAKE INVALID / REDEEM
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
