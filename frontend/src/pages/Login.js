import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.redirect || "/";

  const handleLogin = async () => {
    const res = await api.post("/users/login", { email, password });
    localStorage.setItem("token", res.data.token);
    navigate(redirectTo);
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
