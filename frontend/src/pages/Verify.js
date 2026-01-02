import { useState } from "react";
import api from "../api/api";
import "./Auth.css";

const Verify = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    try {
      await api.post("/users/verify", { email, code });
      alert("Account verified successfully");
    } catch {
      alert("Verification failed");
    }
  };

  return (
    <div className="auth-page">
      <h2>Verify Account</h2>

      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Verification Code" onChange={e => setCode(e.target.value)} />

      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default Verify;
