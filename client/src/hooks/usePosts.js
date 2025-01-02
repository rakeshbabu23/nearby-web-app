import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import apiClient from "../services/api";
import { useAuth } from "../contexts/Auth/AuthContext";
const obj = {
  "10km": 10000,
  "25km": 25000,
  "50km": 50000,
};
const usePosts = (range = "10km", tags, tagsLoading) => {
  const { isLoggedIn } = useAuth();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!hasMore) {
          return;
        }
        setPostsLoading(true);
        const response = await apiClient.get(
          `/post?maxDistance=${obj[range]}&tags=${JSON.stringify(
            tags
          )}&page=${page}`
        );
        setPostsLoading(false);
        setHasMore(response.data.data.length > 0);
        setPosts((prev) => [...prev, ...response.data.data]);
      } catch (e) {
        setPostsLoading(false);
        console.error("Error fetching posts:", e);
        toast.error("An error occurred while fetching posts");
      }
    };
    if (isLoggedIn && !tagsLoading) {
      fetchPosts();
    }
  }, [page, tags, range, isLoggedIn]);
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [tags, range]);
  const addNewPost = useCallback((newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setPage(1);
  }, []);
  return { addNewPost, setPosts, posts, postsLoading, setPage, hasMore, page };
};

export default usePosts;
