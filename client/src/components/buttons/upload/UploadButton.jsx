import React from "react";

import styles from "./UploadButton.module.css";
import { useNavigate } from "react-router-dom";

const UploadButton = ({ children, onClick, disabled }) => {
  const navigate = useNavigate();
  return (
    <button
      className={styles.btn}
      onClick={() => navigate("/upload")}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

export default UploadButton;
