import React, { useEffect, useState } from "react";
import styles from "./TextPost.module.css";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useAuth2 } from "../../../contexts/User/UserContext";
import apiClient from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Header = ({ profileImage, name, time }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className={styles.header}>
      <img
        src={profileImage}
        alt={`${name}'s profile`}
        className={styles.profileImage}
      />
      <div className={styles.headerInfo}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.time}>{formatDate(time)}</p>
      </div>
    </div>
  );
};

const TextPost = ({ post }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { likedPosts, setLikedPosts } = useAuth2();
  const [currentLikedPosts, setCurrentLikedPosts] = useState([]);
  const { mutate: doLike, isLoading: likePostLoading } = useMutation({
    mutationFn: async (postId) => {
      const response = await apiClient.post(`/post/like`, {
        postId,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });
  const handleLike = async (e, postId) => {
    e.stopPropagation();

    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };
  useEffect(() => {
    if (post.isUserLiked) {
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (post.isUserLiked) {
          newSet.add(post._id);
        }

        return newSet;
      });
    }
  }, []);

  return (
    <div className={styles.postsContainer}>
      <div
        key={post._id}
        className={styles.container}
        onClick={() => navigate(`/post/${post._id}`)}
      >
        <Header
          profileImage={
            post?.ownerDetails?.profileImage
              ? post.ownerDetails.profileImage
              : "https://pearlss4development.org/wp-content/uploads/2020/05/profile-placeholder.jpg"
          }
          name={post.ownerDetails.name}
          time={post.createdAt}
        />
        <div className={styles.content}>
          <p>
            {post.text.length > 100 ? (
              <>
                {post.text.slice(0, 100)}...{" "}
                <span style={{ color: "blue", cursor: "pointer" }}>
                  Read more
                </span>
              </>
            ) : (
              post.text
            )}
          </p>
        </div>
        <div className={styles.footer}>
          <button
            className={styles.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentLikedPosts(
                currentLikedPosts.includes(post._id)
                  ? currentLikedPosts.filter(
                      (likedPost) => likedPost !== post._id
                    )
                  : [...currentLikedPosts, post._id]
              );
              handleLike(e, post._id);
              doLike(post._id);
            }}
          >
            <Heart
              className={`${styles.icon} ${
                likedPosts.has(post._id) ? styles.liked : ""
              }`}
              size={20}
            />
            <span>
              {likedPosts.has(post._id) && currentLikedPosts.includes(post._id)
                ? post.likes + 1
                : likedPosts.has(post._id)
                ? post.likes
                : post.likes > 0
                ? post.likes - 1
                : 0}
            </span>
          </button>
          <button className={styles.actionButton}>
            <MessageCircle className={styles.icon} size={20} />
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextPost;
