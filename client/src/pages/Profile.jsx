import React, { useState } from "react";
import styles from "./Profile.module.css";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api";
import { useAuth } from "../contexts/Auth/AuthContext";
import TextPost from "../components/posts/textpost/TextPost";
import ImagePost from "../components/posts/imagepost/ImagePost";
import VideoPost from "../components/posts/videopost/VideoPost";
import EditProfileModal from "../components/profile/EditProfile";
const Profile = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const { data: userPosts, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/user/posts");
        return response.data.data;
      } catch (error) {
        console.error("Error fetching user", error);
        return null;
      }
    },
  });
  const { data: userInfo, isLoading: userInfoLoading } = useQuery({
    queryKey: ["userInfo"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/user/");
        return response.data.data;
      } catch (error) {
        console.error("Error fetching user", error);
        return null;
      }
    },
  });

  return (
    <div className={styles.container}>
      {userInfoLoading ? (
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner} />
        </div>
      ) : (
        <>
          <div className={styles.hero}>
            <div className={styles.heroOverlay} />
          </div>

          <div className={styles.mainContent}>
            <div className={styles.profileWrapper}>
              {/* Profile Card */}
              <div className={styles.profileCard}>
                <div className={styles.profileCardContent}>
                  <div className={styles.profileImageSection}>
                    <div className={styles.profileImageWrapper}>
                      <img
                        className={styles.profileImage}
                        src={
                          userInfo?.profileImage ||
                          "https://pearlss4development.org/wp-content/uploads/2020/05/profile-placeholder.jpg"
                        }
                        alt={userInfo?.name || "Guest User"}
                      />
                      <button className={styles.cameraButton}>
                        <svg
                          className={styles.cameraIcon}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </button>
                    </div>
                    <div className={styles.profileInfo}>
                      <h1 className={styles.profileName}>
                        {userInfo?.name || "Guest User"}
                      </h1>
                      <div className={styles.locationWrapper}>
                        <svg
                          className={styles.locationIcon}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className={styles.locationText}>
                          {userInfo?.address || "No address provided"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.editProfileWrapper}>
                    <button
                      className={styles.editProfileButton}
                      onClick={() => setShowModal(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts Section */}
              <div className={styles.postsSection}>
                {isLoading ? (
                  <div className={styles.loadingWrapper}>
                    <div className={styles.loadingSpinner} />
                  </div>
                ) : userPosts ? (
                  userPosts.length > 0 ? (
                    <div className={styles.postsGrid}>
                      {userPosts.map((post) => (
                        <div key={post.id} className={styles.postCard}>
                          {post.media.images.length < 1 &&
                          post.media.videos.length < 1 ? (
                            <TextPost post={post} />
                          ) : post.media.images.length > 0 ? (
                            <ImagePost post={post} />
                          ) : (
                            <VideoPost post={post} />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No posts to display</p>
                    </div>
                  )
                ) : (
                  <div className={styles.errorState}>
                    <p>Error loading posts</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {showModal && (
            <EditProfileModal
              user={userInfo}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
