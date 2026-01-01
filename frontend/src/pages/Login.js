import { useState } from "react";
import { apiRequest } from "../api/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
  try {
    const res = await apiRequest("/users/login", "POST", { email, password });
    localStorage.setItem("token", res.token);
    alert("Login successful");
  } catch (error) {
    alert(error.message);
  }
};


  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={submit}>Login</button>
    </div>
  );
}
