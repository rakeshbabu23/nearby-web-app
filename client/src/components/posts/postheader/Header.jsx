import React from "react";
import styles from "./Header.module.css";
const Header = ({ profileImage, name, time }) => {
  return (
    <div className={styles.container}>
      <div className={styles["img-holder"]}>
        <img
          src={
            profileImage
              ? profileImage
              : "https://randomuser.me/api/portraits/men/1.jpg"
          }
          alt="post-owner-image"
        />
      </div>
      <div className={styles["owner-info"]}>
        <p className={styles.name}>{name}</p>
        <p className={styles.time}>{time}</p>
      </div>
    </div>
  );
};

export default Header;
