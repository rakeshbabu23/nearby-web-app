import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import apiClient from "../../services/api";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();
export const useAuth2 = () => {
  return useContext(UserContext);
};

const obj = {
  "10km": 10000,
  "25km": 25000,
  "50km": 50000,
};
const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [postUploading, setPostUploading] = useState(false);
  const { isLoggedIn, setUser } = useAuth();
  const [range, setRange] = useState("10km");
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());

  // const {
  //   data: posts,
  //   isLoading: postsLoading,
  //   refetch: postRefetch,
  // } = useQuery({
  //   enabled: isLoggedIn,
  //   queryKey: ["posts", range, selectedTags],
  //   queryFn: async () => {
  //     try {
  //       const response = await apiClient.get(
  //         `/post?maxDistance=${obj[range]}&tags=${JSON.stringify(selectedTags)}`
  //       );
  //       return response.data.data;
  //     } catch (e) {
  //       if (e.status === 401) {
  //         toast.error("Session expired, please login again");
  //         navigate("/login");
  //         setUser(null);
  //         return;
  //       }
  //       toast.error(e?.response?.data?.message || "Error in fetching posts");
  //     }
  //   },
  // });
  const { data: userInfo } = useQuery({
    enabled: isLoggedIn,
    queryKey: ["userInfo"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/user`);
        return response.data.data || [];
      } catch (e) {
        if (e.status === 401) {
          toast.error("Session expired, please login again");
          navigate("/login");
          setUser(null);
          return;
        }
        toast.error(e?.response?.data?.message || "Unknown error");
      }
    },
  });
  const {
    data: people,
    refetch: peopleRefetch,
    isLoading: peopleLoading,
  } = useQuery({
    enabled: isLoggedIn,
    queryKey: ["people", range, selectedTags],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `/user/nearby?maxDistance=${obj[range]}`
        );
        return response.data.data;
      } catch (e) {
        if (e.status === 401) {
          toast.error("Session expired, please login again");
          navigate("/login");
          setUser(null);
          return;
        }
        toast.error(
          e?.response?.data?.message ||
            "Error in finding people with specified distance"
        );
      }
    },
  });
  const {
    data: nearByTags,
    refetch: tagsRefetch,
    isLoading: tagsLoading,
  } = useQuery({
    enabled: isLoggedIn,
    queryKey: ["tags", range],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/user/tags`);
        return response.data.data;
      } catch (e) {
        if (e.status === 401) {
          toast.error("Session expired, please login again");
          navigate("/login");
          setUser(null);
          return;
        }
        toast.error(
          e?.response?.data?.message ||
            "Error in fetching tags within specified distance"
        );
      }
    },
  });

  useEffect(() => {
    if (nearByTags) {
      setAllTags(nearByTags);
      setSelectedTags(nearByTags);
    }
    if (userInfo) {
      setUser(userInfo);
    }
  }, [nearByTags, userInfo]);

  return (
    <UserContext.Provider
      value={{
        range,
        selectedTags,
        allTags,
        setRange,
        setAllTags,

        people,
        peopleLoading,
        nearByTags,
        tagsLoading,
        likedPosts,
        setSelectedTags,
        setLikedPosts,
        peopleRefetch,
        tagsRefetch,
        // postRefetch,
        postUploading,
        setPostUploading,
        userInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
