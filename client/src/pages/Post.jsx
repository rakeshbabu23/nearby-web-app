import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { formatDate } from "../utils/timeFormatter";
import { Heart, MessageCircle, Send } from "lucide-react";
import apiClient from "../services/api";
import { useAuth2 } from "../contexts/User/UserContext";
import styles from "./Post.module.css";

const Post = () => {
  const queryClient = useQueryClient();
  const { postId } = useParams();
  const { setLikedPosts } = useAuth2();
  const [comment, setComment] = useState("");
  const [postType, setPostType] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await apiClient.get(`/post/${postId}`);
      return response.data.data;
    },
  });

  const { mutate: doComment, isLoading: addCommentLoading } = useMutation({
    mutationFn: async (commentText) => {
      const response = await apiClient.post(`/post/comment`, {
        postId,
        comment: commentText,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setComment(""); // Clear comment after successful submission
      queryClient.invalidateQueries(["post", postId]);
    },
    onError: (error) => {
      alert("Error in adding comment: " + error.message);
    },
  });

  useEffect(() => {
    if (data) {
      setPostType(
        data.post?.media?.images?.length > 0
          ? "image"
          : data.post?.media?.videos?.length > 0
          ? "video"
          : "text"
      );
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      doComment(comment.trim());
    }
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    try {
      await apiClient.post(`/post/like`, { postId });
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
    } catch (error) {
      alert("Error in liking post: " + error.message);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={
          postType === "image" || postType === "video"
            ? styles.container
            : styles.container2
        }
      >
        {postType === "image" || postType === "video" ? (
          <>
            <div className={styles.media}>
              {postType === "image" ? (
                <img
                  src={data.post.media.images[0].imageUrl}
                  alt="Post content"
                  className={styles.mainImage}
                />
              ) : (
                <video
                  controls
                  src={data.post.media.videos[0].videoUrl}
                  className={styles.mainImage}
                />
              )}
            </div>
            <div className={styles.postInfo}>
              <>
                <div className={styles.postHeader}>
                  <div className={styles.postOwnerContainer}>
                    <div className={styles.imgHolder}>
                      <img
                        src={
                          data?.post?.owner?.profileImage ||
                          "/api/placeholder/40/40"
                        }
                        alt={data?.post?.owner?.name || "User"}
                      />
                    </div>
                    <div className={styles.ownerInfo}>
                      <p className={styles.name}>{data?.post?.owner?.name}</p>
                      <p className={styles.title}>
                        {data?.post?.createdAt &&
                          formatDate(data.post.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {data.post.text && (
                  <div className={styles.postDesc}>
                    <p>{data.post.text}</p>
                  </div>
                )}

                <div className={styles.engagement}>
                  <button
                    className={styles.actionButton}
                    onClick={(e) => handleLike(e, data.post._id)}
                  >
                    <Heart
                      className={`${styles.icon} ${
                        data.post.isUserLiked ? styles.liked : ""
                      }`}
                      size={20}
                    />

                    <span>{data.post.likes}</span>
                  </button>
                  <button className={styles.actionButton}>
                    <MessageCircle size={20} />
                    <span>{data.post.comments || 0}</span>
                  </button>
                </div>

                <div className={styles.comments}>
                  {data.comments?.map((comment) => (
                    <div key={comment._id} className={styles.commentItem}>
                      <div className={styles.commentAvatar}>
                        <img
                          src={
                            comment.userId.profileImage ||
                            "/api/placeholder/40/40"
                          }
                          alt={comment.userId.name}
                        />
                      </div>
                      <div className={styles.commentContent}>
                        <div className={styles.commentHeader}>
                          <p className={styles.commentUser}>
                            {comment.userId.name}
                          </p>
                          <span className={styles.commentTime}>
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className={styles.commentText}>{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fixed comment input section */}
                <form onSubmit={handleSubmit} className={styles.commentInput}>
                  <input
                    type="text"
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment..."
                    className={styles.input}
                    disabled={addCommentLoading}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={addCommentLoading || !comment.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            </div>
          </>
        ) : (
          <div className={styles.postInfo}>
            <>
              <div className={styles.postHeader}>
                <div className={styles.postOwnerContainer}>
                  <div className={styles.imgHolder}>
                    <img
                      src={
                        data?.post?.owner?.profileImage ||
                        "/api/placeholder/40/40"
                      }
                      alt={data?.post?.owner?.name || "User"}
                    />
                  </div>
                  <div className={styles.ownerInfo}>
                    <p className={styles.name}>{data?.post?.owner?.name}</p>
                    <p className={styles.title}>
                      {data?.post?.createdAt && formatDate(data.post.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {data.post.text && (
                <div className={styles.postDesc}>
                  <p>{data.post.text}</p>
                </div>
              )}

              <div className={styles.engagement}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => handleLike(e, data.post._id)}
                >
                  <Heart
                    className={`${styles.icon} ${
                      data.post.isUserLiked ? styles.liked : ""
                    }`}
                    size={20}
                  />

                  <span>{data.post.likes}</span>
                </button>
                <button className={styles.actionButton}>
                  <MessageCircle size={20} />
                  <span>{data.post.comments?.length || 0}</span>
                </button>
              </div>

              <div className={styles.comments}>
                {data.comments?.map((comment) => (
                  <div key={comment._id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>
                      <img
                        src={
                          comment.userId.profileImage ||
                          "/api/placeholder/40/40"
                        }
                        alt={comment.userId.name}
                      />
                    </div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <p className={styles.commentUser}>
                          {comment.userId.name}
                        </p>
                        <span className={styles.commentTime}>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fixed comment input section */}
              <form onSubmit={handleSubmit} className={styles.commentInput}>
                <input
                  type="text"
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="Add a comment..."
                  className={styles.input}
                  disabled={addCommentLoading}
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={addCommentLoading || !comment.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
