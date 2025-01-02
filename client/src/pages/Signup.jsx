// Signup.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

import styles from "./Signup.module.css";
import { useAuth } from "../contexts/Auth/AuthContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
    profileImage: null,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profileImage: file });
  };

  const handleSignup = async () => {
    if (otpVerified) {
      await signup(
        formData.fullName,
        formData.email,
        formData.password,
        formData.gender,
        formData.profileImage
      );
    }
  };

  const handleSendOtp = async () => {
    try {
      await apiClient.post("/auth/send-otp", {
        email: formData.email,
      });
      setOtpSent(true);
      toast.success("OTP sent successfully");
    } catch (e) {
      console.error("Failed to send OTP", e);
      toast.error(
        e?.response?.data?.message || "Error in sending otp.Please try again"
      );
    }
  };
  const handleVerifyOtp = async () => {
    try {
      await apiClient.post("/auth/verify-otp", {
        email: formData.email,
        otp,
      });
      setOtpSent(false);
      setOtpVerified(true);
      toast.success("OTP verified successfully");
    } catch (e) {
      console.error("Failed to send OTP", e);
      toast.error(
        e?.response?.data?.message ||
          "Error in otp verification.Please try again"
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.title}>Create Account</h2>

        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
          />
        </div>
        {formData.email && !otpVerified && (
          <div
            style={{
              alignSelf: "flex-end",
              marginBottom: "0.5rem",
            }}
          >
            <button
              className={styles["otp-btn"]}
              onClick={() => handleSendOtp()}
            >
              Send otp
            </button>
          </div>
        )}
        <div
          className={styles.inputGroup}
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <input
            className={styles.input}
            style={{
              color: otpSent ? "white" : "black",
            }}
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={otpSent || otpVerified}
          />
        </div>
        {formData.email && otpSent && !otpVerified && (
          <>
            <div
              style={{
                alignSelf: "flex-end",
                marginBottom: "0.5rem",
              }}
            >
              <button
                className={styles["otp-btn"]}
                onClick={() => handleVerifyOtp()}
              >
                Verify otp
              </button>
            </div>
            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </>
        )}

        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <select
            className={styles.select}
            value={formData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className={styles.fileUploadContainer}>
          <label htmlFor="profileImage" className={styles.fileUploadLabel}>
            Upload Profile Image
          </label>
          <input
            type="file"
            id="profileImage"
            onChange={handleFileChange}
            className={styles.fileUploadInput}
            accept="image/*"
          />
        </div>

        <button
          className={styles.button}
          onClick={handleSignup}
          disabled={
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.gender ||
            !otpVerified
          }
        >
          Sign Up
        </button>

        <div className={styles.switchContainer}>
          <p>Already have an account?</p>
          <button
            className={styles.switchLink}
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
