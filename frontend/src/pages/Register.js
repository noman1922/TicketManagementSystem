import { useState } from "react";
import { apiRequest } from "../api/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
  try {
    await apiRequest("/users/register", "POST", form);
    alert("Registered! Check console for verification code.");
  } catch (error) {
    alert(error.message);
  }
};


  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <button onClick={submit}>Register</button>
    </div>
  );
}
