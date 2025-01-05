import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 
  
    const handleSignup = () => {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find((u) => u.email === email)) {
        alert("Email already registered!");
        return;
      }
  
      users.push({ email, password });
      localStorage.setItem("users", JSON.stringify(users));
      alert("Signup successful! You can now log in.");
      setEmail("");
      setPassword("");
      navigate("/login"); 
    };
  
    return (
      <div className="auth-container">
        <h2>Signup</h2>
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
        <button onClick={handleSignup}>Signup</button>
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    );
  };
  
  export default Signup;