import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/">Home</Link> | 
      <Link to="/dashboard">Dashboard</Link> | 
      <Link to="/analytics/sample123">Analytics</Link> | 
      <Link to="/login">Login</Link> | 
      <Link to="/register">Register</Link> | 
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
