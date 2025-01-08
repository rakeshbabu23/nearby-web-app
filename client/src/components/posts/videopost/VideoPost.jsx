import React, { useState, useEffect, useRef } from "react";
import styles from "./VideoPost.module.css";
import moment from "moment";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useAuth2 } from "../../../contexts/User/UserContext";
import apiClient from "../../../services/api";
import { useNavigate } from "react-router-dom";
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

const VideoPost = ({ post }) => {
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
  const videoRef = useRef(null);

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    try {
      await apiClient.post(`/post/like`, {
        postId,
      });
    } catch (error) {
      alert("error in liking post", error.message);
    }
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef?.current?.play().catch((error) => {
            console.error("Video play failed:", error);
          });
        } else {
          videoRef?.current?.pause();
        }
      },
      {
        threshold: 0.7,
      }
    );
    if (videoRef.current) {
      observer.observe(videoRef?.current);
    }
    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef?.current);
      }
    };
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
        <div className={styles.postText}>
          <p>
            {post.text.length > 20 ? (
              <>
                {post.text.slice(0, 20)}...{" "}
                <span style={{ color: "blue", cursor: "pointer" }}>
                  Read more
                </span>
              </>
            ) : (
              post.text
            )}
          </p>
        </div>
        <div className={styles.imageHolder}>
          <video
            muted
            loop
            ref={videoRef}
            controls
            src={post.media?.videos[0]?.videoUrl}
            alt="post content"
            className={styles.videoPost}
          />
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

export default VideoPost;
