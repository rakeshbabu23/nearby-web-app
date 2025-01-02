import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/navbar/Navbar";
import Main from "../layout/main/Main";
import Modal from "../components/modal/Modal";
import Container from "../components/general/container/Container";
import Topics from "../layout/main/options/topics/Topics";
import Range from "../layout/main/options/ranges/Range";
import People from "../layout/main/options/people/People";
import apiClient from "../services/api";

const Home = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showChatModal, setShowChatModal] = useState({
    state: false,
    person: null,
  });
  const handleLogout = async () => {
    try {
      await apiClient.post("/user/logout");
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again later.");
    }
  };
  return (
    <Container>
      <div
        style={{
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#0F172A",
        }}
      >
        <Navbar setShowMenu={setShowMenu} />
        <Main
          showChatModal={showChatModal}
          setShowChatModal={setShowChatModal}
          showMenu={showMenu}
        />
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <p>hello</p>
          </Modal>
        )}
        {showMenu && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              height: "100%",
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "1rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => setShowMenu(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  textAlign: "right",
                  width: "100%",
                  color: "#fff",
                }}
                aria-label="Close menu"
              >
                &times;
              </button>

              {/* Add Range and Topics */}
              <Range />
              <Topics />
              <People setShowChatModal={setShowChatModal} />
              <div
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  backgroundColor: "#fff",
                  padding: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "3rem",
                }}
                onClick={() => handleLogout()}
              >
                <p
                  style={{
                    color: "red",
                    fontSize: "1.5rem",
                    fontWeight: 500,
                  }}
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Home;
