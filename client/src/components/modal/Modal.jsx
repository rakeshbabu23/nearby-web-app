import React from "react";
import styles from "./Modal.module.css";
const Modal = ({ children, onClose }) => {
  return (
    <div className={styles.modal}>
      <div className={styles["modal-content"]}>{children}</div>
    </div>
  );
};

export default Modal;
