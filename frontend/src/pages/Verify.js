import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";
import "./Auth.css";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    try {
      await api.post("/users/verify", { email, code });
      alert("Account verified successfully! Please login.");
      navigate("/login");
    } catch {
      alert("Verification failed. Invalid code or email.");
    }
  };

  return (
    <div className="auth-page">
      <h2>Verify Account</h2>

      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Verification Code" value={code} onChange={e => setCode(e.target.value)} />

      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default Verify;
