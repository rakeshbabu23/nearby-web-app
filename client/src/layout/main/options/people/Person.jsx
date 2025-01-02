import React from "react";
import styles from "./Person.module.css";
const Person = ({
  person,
  profileImage,
  name,
  setShowChatModal,
  isSelected,
}) => {
  return (
    <button
      className={`${styles.card} ${isSelected ? styles.selected : ""}`}
      onClick={() =>
        setShowChatModal({
          state: true,
          person,
        })
      }
    >
      <div className={styles.imgHolder}>
        <img
          src={
            person.receiverDetails.profileImage
              ? person.receiverDetails.profileImage
              : "https://pearlss4development.org/wp-content/uploads/2020/05/profile-placeholder.jpg"
          }
          alt={person.receiverDetails.name}
        />
      </div>
      <p className={styles.name}>{person.receiverDetails.name}</p>
    </button>
  );
};

export default Person;
