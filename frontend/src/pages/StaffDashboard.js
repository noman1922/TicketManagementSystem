import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Dashboard.css"; // Reusing Dashboard styles for now

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
                <div className="header-actions">
                    <span className="user-badge">Staff Panel</span>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <div className="dashboard-stats" style={{ gridTemplateColumns: '1fr' }}>
                <div className="stat-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3>QR Ticket Scanner</h3>

                    <div className="scanner-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexDirection: 'column' }}>

                        {/* CAMERA SCANNER AREA */}
                        {isScanning ? (
                            <div className="scanner-wrapper fade-in" style={{ background: '#000', padding: '10px', borderRadius: '8px', position: 'relative' }}>
                                <div id="reader" style={{ width: '100%' }}></div>
                                <button
                                    className="btn-secondary"
                                    onClick={() => setIsScanning(false)}
                                    style={{ marginTop: '10px', width: '100%', background: '#dc3545', color: '#fff' }}
                                >
                                    ❌ Stop Camera
                                </button>
                            </div>
                        ) : (
                            <button className="btn-primary" onClick={() => setIsScanning(true)} style={{ width: '100%', padding: '15px' }}>
                                📷 Scan with Camera
                            </button>
                        )}

                        <div style={{ textAlign: 'center', margin: '10px 0' }}>or enter code manually</div>

                        <form onSubmit={handleManualScan} style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={bookingId}
                                onChange={(e) => setBookingId(e.target.value)}
                                placeholder="Enter Booking ID"
                                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                            />
                            <button type="submit" className="btn-secondary" disabled={loading}>
                                {loading ? "Verifying..." : "Check Ticket"}
                            </button>
                        </form>
                    </div>

                    {/* Results Display */}
                    {error && (
                        <div className="error-msg shake" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px' }}>
                            ❌ {error}
                        </div>
                    )}

                    {scanResult && (
                        <div className="success-msg scale-in" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <span style={{
                                    background: scanResult.booking?.status === 'Used' ? '#fee2e2' : '#dcfce7',
                                    color: scanResult.booking?.status === 'Used' ? '#991b1b' : '#166534',
                                    padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold'
                                }}>
                                    {scanResult.booking?.status === 'Used' ? '⚠️ ALREADY USED' : '✅ VALID TICKET'}
                                </span>
                            </div>

                            <p><strong>Event:</strong> {scanResult.booking?.eventName || "Event Details Loaded"}</p>
                            <p><strong>Customer:</strong> {scanResult.booking?.customerName}</p>
                            <p><strong>Ticket Type:</strong> {scanResult.booking?.ticketType || "Standard"}</p>
                            <p><strong>Quantity:</strong> {scanResult.booking?.quantity}</p>
                            <p style={{ fontSize: '0.8em', color: '#666' }}>ID: {scanResult.booking?.id}</p>

                            {/* VALIDATE ACTION */}
                            {scanResult.booking?.status !== 'Used' && (
                                <button
                                    className="btn-primary"
                                    onClick={validateTicket}
                                    disabled={loading}
                                    style={{ width: '100%', marginTop: '15px', background: '#dc2626', border: 'none' }}
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
