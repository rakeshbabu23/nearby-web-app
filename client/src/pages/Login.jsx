import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/Auth/AuthContext";
import styles from "./Login.module.css";
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    await login(formData.email, formData.password);
  };
  useEffect(() => {
    const handleEnter = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
      }
    };
    window.addEventListener("keydown", handleEnter);

    return () => {
      window.removeEventListener("keydown", handleEnter);
    };
  }, [formData]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>

      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleInputChange("password", e.target.value)}
      />
      <button className={styles.button} onClick={handleLogin}>
        Login
      </button>

      <div className={styles.switchContainer}>
        <p>Don't have an account?</p>
        <a
          href="#"
          className={styles.switchText}
          onClick={() => {
            navigate("/signup");
          }}
        >
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default Login;
