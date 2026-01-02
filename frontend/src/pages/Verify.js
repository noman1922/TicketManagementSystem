import { useState } from "react";
import api from "../api/api";

const Verify = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleVerify = async () => {
    await api.post("/users/verify", { email, code });
    alert("Verified successfully");
  };

  return (
    <div>
      <h2>Verify Account</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Code" onChange={e => setCode(e.target.value)} />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default Verify;
