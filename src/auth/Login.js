import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Login = ({ setIsLoggedIn }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 
  
    const handleLogin = () => {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.email === email && u.password === password
      );
  
      if (user) {
        localStorage.setItem("loggedIn", "true");
        setIsLoggedIn(true);
        alert("Login successful!");
        navigate("/"); 
      } else {
        alert("Invalid email or password.");
      }
    };
  
    return (
      <div className="auth-container">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    );
  };
  
  export default Login;