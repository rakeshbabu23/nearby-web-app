import React, { useState } from "react";
import styles from "./Logout.module.css";
import { LogOut } from "lucide-react";
import apiClient from "../../../services/api";
import { useNavigate } from "react-router-dom";

const Logout = ({ color = "white" }) => {
  const navigate = useNavigate();
  const [mouseEntered, setMouseEntered] = useState(false);
  const handleLogout = async () => {
    try {
      await apiClient.post("/user/logout");
      alert("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again later.");
    }
  };
  return (
    <button
      className={styles.btn}
      onClick={handleLogout}
      onMouseEnter={() => setMouseEntered((prev) => !prev)}
      onMouseLeave={() => setMouseEntered((prev) => !prev)}
      type="button"
      aria-label="Logout"
    >
      <LogOut size={20} color={mouseEntered ? "red" : color} />
    </button>
  );
};

export default Logout;
