import React, { useLayoutEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import apiClient, { setToken } from "../services/api";
import { useAuth } from "../contexts/Auth/AuthContext";
const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  //const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkValidUser = async () => {
    try {
      setIsLoading(true);

      // First check if the user is authenticated
      const response = await apiClient.post("/auth/me");
      const { isAuthenticated, message } = response?.data?.data;

      if (isAuthenticated) {
        setIsLoggedIn(true);
      }

      // Handle TOKEN_EXPIRED
      if (message === "TOKEN_EXPIRED") {
        const response2 = await apiClient.get("/auth/refresh");
        const token = response2.data.data;
        setToken(token);
        setIsLoggedIn(true);
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        // Refresh token attempt
        try {
          const response2 = await apiClient.get("/auth/refresh");

          const token = response2.data.data;
          setToken(token);
          setIsLoggedIn(true);
        } catch (e) {
          toast.error("Unauthorized. Please log in again.");
          setToken(null);
          navigate("/login");
          setIsLoggedIn(false);
        }
      } else {
        // Handle other unexpected errors or show appropriate messages
        toast.error("Unauthorized. Please log in again.");
        setToken(null);
        navigate("/login");
        setIsLoggedIn(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    checkValidUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
