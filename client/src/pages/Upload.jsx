import React, { useState, useRef } from "react";
import { toast } from "react-toastify";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../services/api";
import styles from "./Upload.module.css";
import { useNavigate } from "react-router-dom";
import usePosts from "../hooks/usePosts";
import { useAuth2 } from "../contexts/User/UserContext";

const Upload = () => {
  const navigate = useNavigate();
  const { range, selectedTags, tagsLoading } = useAuth2();
  const { setPosts, posts, setPage, addNewPost } = usePosts(
    range,
    selectedTags,
    tagsLoading
  );
  const toastId = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [days, setDays] = useState(24);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const mediaRef = useRef(null);
  // const { mutate: doPost, isLoading } = useMutation({
  //   mutationFn: async () => {
  //     const formData = new FormData();
  //     if (selectedFile) {
  //       formData.append("file", selectedFile);
  //     }
  //     formData.append("expiresIn", days.toString());
  //     const formattedTags =
  //       tags && tags.length > 0 ? tags.split(",").map((tag) => tag.trim()) : [];
  //     formData.append("tags", JSON.stringify(formattedTags));
  //     formData.append("text", description || "");
  //     navigate("/main");
  //     toastId.current = toast("Post uploading...", {
  //       autoClose: false,
  //     });
  //     const response = await apiClient.post("/post/create", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       withCredentials: true,
  //     });

  //     if (!response.data?.data) {
  //       throw new Error("Invalid server response");
  //     }

  //     return response.data.data;
  //   },
  //   onSuccess: (data) => {
  //     console.log("Post created successfully", data);
  //     toast.dismiss(toastId.current);
  //     toast.success("Post created successfully");
  //     setPreviewUrl("");
  //     setSelectedFile(null);
  //     setDays(24);
  //     setTags("");
  //     setDescription("");
  //     setPage(1);
  //     setPosts([data, ...posts]);
  //     //queryClient.invalidateQueries(["posts"]);
  //   },
  //   onError: (error) => {
  //     toast.dismiss(toastId.current);
  //     const message =
  //       error?.response?.data?.message || error.message || "Upload failed";
  //     console.error(message);
  //   },
  // });
  const handlePostSubmit = async () => {
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("expiresIn", days.toString());
      const formattedTags = tags
        ? tags.split(",").map((tag) => tag.trim())
        : [];
      formData.append("tags", JSON.stringify(formattedTags));
      formData.append("text", description || "");

      toastId.current = toast("Post uploading...", { autoClose: false });
      navigate("/main");
      const response = await apiClient.post("/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (!response.data?.data) {
        throw new Error("Invalid server response");
      }

      const newPost = response.data.data;

      toast.dismiss(toastId.current);
      toast.success("Post created successfully");

      setPreviewUrl("");
      setSelectedFile(null);
      setDays(24);
      setTags("");
      setDescription("");
      addNewPost(newPost);
    } catch (error) {
      toast.dismiss(toastId.current);
      const message =
        error?.response?.data?.message || error.message || "Upload failed";
      console.error(message);
      toast.error(message);
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!description && !selectedFile) {
      toast.error("Please add description or select a file to upload");
      return;
    }
    handlePostSubmit();
  };
  const expirationOptions = [
    { value: 24, label: "1 day" },
    { value: 48, label: "2 days" },
    { value: 168, label: "1 week" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <div className={styles.previewArea}>
          <input
            ref={mediaRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className={styles.fileInput}
            id="fileInput"
          />
          {!previewUrl ? (
            <label htmlFor="fileInput" className={styles.uploadLabel}>
              <div className={styles.uploadPlaceholder}>
                <p>Click to upload image or video</p>
                <p className={styles.supportedFormats}>
                  Supports: JPG, PNG, MP4, etc.
                </p>
              </div>
            </label>
          ) : (
            <>
              <div className={styles.preview}>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    mediaRef.current.value = ""; // Reset the file input field
                    setSelectedFile(null); // Clear the selected file
                    setPreviewUrl(null); // Clear the preview URL
                  }}
                >
                  Delete
                </button>
                {selectedFile?.type.startsWith("image/") ? (
                  <img src={previewUrl} alt="Preview" />
                ) : (
                  <video src={previewUrl} controls />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.formSection}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Expiration:</label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className={styles.select}
            >
              {expirationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tags">Tags (comma-separated):</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., nature, travel, photography"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows="4"
            />
          </div>

          <button type="submit" className={styles.uploadButton}>
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
