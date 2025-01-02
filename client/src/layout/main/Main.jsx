import React, { useEffect } from "react";
import styles from "./Main.module.css";
import Topics from "./options/topics/Topics";
import People from "./options/people/People";
import Range from "./options/ranges/Range";
import TextPost from "../../components/posts/textpost/TextPost";
import ImagePost from "../../components/posts/imagepost/ImagePost";
import { useAuth2 } from "../../contexts/User/UserContext";
import VideoPost from "../../components/posts/videopost/VideoPost";
import ChatScreen from "../../components/chat/ChatScreen";
import Loader from "../../components/general/loader/Loader";
import usePosts from "../../hooks/usePosts";
const Main = ({ showChatModal, setShowChatModal, showMenu }) => {
  const { range, selectedTags, tagsLoading } = useAuth2();
  const { posts, postsLoading, setPage, hasMore, page } = usePosts(
    range,
    selectedTags,
    tagsLoading
  );

  const handleScroll = () => {
    console.log("Scroll height", window.innerHeight);
    console.log("Scroll top", document.documentElement.scrollTop);
    console.log("Scroll height", document.documentElement.scrollHeight);
    if (
      window.innerHeight + document.documentElement.scrollTop + 1 >=
      document.documentElement.scrollHeight
    ) {
      if (!postsLoading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }
  };
  useEffect(() => {
    console.log("Scroll listener added");
    document.querySelector("#feed").addEventListener("scroll", handleScroll);
    // return () => {
    //   console.log("Scroll listener removed");
    //   window.removeEventListener("wheel", handleScroll);
    // };
  }, []);

  return (
    <main className={styles["main-container"]}>
      {/* Options Section */}
      <div className={styles.options}>
        <Range />
        <Topics />
        <People setShowChatModal={setShowChatModal} />
      </div>

      {/* Loader or Feed Content */}
      {postsLoading && page === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 500,
            color: "#888",
          }}
        >
          <Loader />
        </div>
      ) : (
        <div className={styles.feedContainer} id="feed">
          <div className={styles.feedContent}>
            {posts && posts.length > 0 ? (
              posts.map((post, index) => {
                if (post?.media?.images?.length > 0) {
                  return <ImagePost post={post} key={index} />;
                } else if (post?.media?.videos?.length > 0) {
                  return <VideoPost post={post} key={index} />;
                } else {
                  return <TextPost post={post} key={index} />;
                }
              })
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  color: "#888",
                  marginTop: "20px",
                }}
              >
                No posts found in specified range
              </p>
            )}
          </div>
          {/* Bottom Loading Indicator */}
          {postsLoading && page !== 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "80px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                color: "#888",
              }}
            >
              <Loader />
            </div>
          )}
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal.state && (
        <div
          style={{
            width: showMenu ? "100%" : "40%",
            height: showMenu ? "100vh" : "80vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            position: "fixed",
            right: 0,
            bottom: 0,
          }}
        >
          <ChatScreen
            person={showChatModal.person}
            onClose={() =>
              setShowChatModal({
                state: false,
                person: null,
              })
            }
          />
        </div>
      )}
    </main>
  );
};

export default Main;
