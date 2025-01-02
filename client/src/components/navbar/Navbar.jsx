import React, { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import { HiPlus } from "react-icons/hi";
import { IoMdMenu } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import UploadButton from "../buttons/upload/UploadButton";
import Logout from "../buttons/logout/Logout";
import Logo from "../../assets/images/icon-192.png";
import { useAuth2 } from "../../contexts/User/UserContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setShowMenu }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { userInfo } = useAuth2();
  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      {/* Logo Section */}
      <div className={styles["logo-container"]}>
        <img src={Logo} alt={"logo"} className={styles["logo-img"]} />
        <h3 className={styles.logo}>Nearby</h3>
      </div>

      {/* Actions Section */}
      <div className={styles.actions}>
        <UploadButton>
          <HiPlus />
          Upload
        </UploadButton>
        <div className={styles.profile} onClick={() => navigate("/profile")}>
          {/* <FaUserCircle size={24} color="white" /> */}
          <img
            src={userInfo?.profileImage}
            alt="profile"
            className={styles.profileImage}
          />
        </div>

        {isMobile ? (
          <IoMdMenu size={30} color="#fff" onClick={() => setShowMenu(true)} />
        ) : (
          <>
            <Logout className={styles.logout} />
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.profile}>
            <FaUserCircle size={24} />
            <span>Profile</span>
          </div>
          <Logout />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
