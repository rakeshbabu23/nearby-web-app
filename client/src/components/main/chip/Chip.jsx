// Chip.jsx
import React from "react";
import styles from "./Chip.module.css";

const Chip = ({ children, onClick, isSelected }) => {
  return (
    <button
      className={`${styles.chip} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Chip;
