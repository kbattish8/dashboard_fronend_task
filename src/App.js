import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true"
  );

  return (
    <Router>
      <Routes>
        
        {!isLoggedIn && <Route path="/" element={<Navigate to="/login" />} />}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<Signup />} />
        {isLoggedIn && <Route path="/" element={<Dashboard setIsLoggedIn={setIsLoggedIn} />} />}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
        
      </Routes>
    </Router>
  );
}

export default App;
