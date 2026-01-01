import { useState } from "react";
import { apiRequest } from "../api/api";

export default function Verify() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const submit = async () => {
  try {
    await apiRequest("/users/verify", "POST", { email, code });
    alert("Verified! Now login.");
  } catch (error) {
    alert(error.message);
  }
};


  return (
    <div>
      <h2>Verify Email</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="6-digit Code" onChange={e => setCode(e.target.value)} />
      <button onClick={submit}>Verify</button>
    </div>
  );
}
