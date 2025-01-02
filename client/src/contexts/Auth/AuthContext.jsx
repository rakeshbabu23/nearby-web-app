import React, { useContext, useEffect, createContext, useState } from "react";
import { toast } from "react-toastify";

import apiClient, { setToken } from "../../services/api";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};
const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState();
  const [coords, setCoords] = useState({});
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  function success(pos) {
    var crd = pos.coords;
    setCoords({ latitude: crd.latitude, longitude: crd.longitude });
  }

  function errors(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }
  useEffect(() => {
    //let locationTimer = null;
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.permissions
          .query({
            name: "geolocation",
          })
          .then((result) => {
            if (result.state === "granted") {
              navigator.geolocation.getCurrentPosition(
                (postion) => {
                  setCoords({
                    latitude: postion.coords.latitude,
                    longitude: postion.coords.longitude,
                  });

                  // clearInterval(locationTimer);
                },
                (errors) => {
                  alert("Error in fetching location", errors.message);
                },
                options
              );
            } else if (result.state === "prompt") {
              navigator.geolocation.getCurrentPosition(
                success,
                errors,
                options
              );
            } else {
              alert("Please enable the location permission");
              console.log("Geolocation permission denied.");
            }
          });
      }
    };
    fetchLocation();
    // setInterval(fetchLocation, 5000);
    // return () => {
    //   clearInterval(locationTimer);
    // };
  }, []);
  const signup = async (name, email, password, gender, profileImage) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append(
        "userLocation",
        JSON.stringify([coords.longitude, coords.latitude])
      );
      formData.append("profileImage", profileImage);
      const response = await apiClient.post("/auth/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { user, accessToken } = response.data.data;
      setUser(user);
      setAccessToken(accessToken);
      setToken(accessToken);
      toast.success("registered successfully");

      navigate("/login");
    } catch (e) {
      console.log(e);
      toast.error(
        e?.response?.data?.message || "Error in registering.Please try again"
      );
    }
  };
  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
        userLocation: [coords.longitude, coords.latitude],
      });
      const { user, accessToken } = response.data.data;
      toast.success("Login successful");
      setUser(user);
      setAccessToken(accessToken);
      setToken(accessToken);
      navigate("/main");
    } catch (e) {
      console.log(e.status);
      toast.error(
        e?.response?.data?.message || "Error in loggin in.Please try again"
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        accessToken,
        coords,
        isLoggedIn,
        setIsLoggedIn,

        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
