import React, { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";

import styles from "./EditProfile.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/api";

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const quertClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    profileImage: user?.profileImage || "",
    address: user?.address || "",
    userLocation: [...(user?.location?.cooridnates || [])] || [],
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profileImage);
  const fileInputRef = useRef(null);
  const debounceTimeout = useRef(null);
  const { mutate: doUpate, isLoading: profileUpdateLoading } = useMutation({
    mutationFn: async (formData) => {
      setIsLoading(true);
      const response = await apiClient.patch(`/user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setIsLoading(false);
      onClose();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsLoading(false);
      quertClient.invalidateQueries(["user"]);
      quertClient.invalidateQueries(["userInfo"]);
      onClose();
    },
    onError: (e) => {
      toast.error(e?.response?.data?.message || "Error in updating profile");
      console.error("Error updating user:", e);
      setIsLoading(false);
    },
  });
  const fetchLocationSuggestions = async (query) => {
    if (!query) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=pk.b947b52cdc557100cbb97527d1289281&q=${query}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(
        data.map((item) => ({
          id: item.place_id,
          display_name: item.display_name,
          address: item.address,
          lat: item.lat,
          lon: item.lon,
        }))
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationSuggestions([]);
    }
  };

  const handleLocationInputChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, address: value }));

    // Debounce location API calls
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  };

  const handleLocationSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      userLocation: [suggestion.lon, suggestion.lat],
    }));
    setLocationSuggestions([]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, profileImage: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("address", formData.address);
      formDataToSubmit.append("userLocation", formData.userLocation);
      if (formData.profileImage instanceof File) {
        formDataToSubmit.append("file", formData.profileImage);
      }

      //await onSave(formDataToSubmit);
      doUpate(formDataToSubmit);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              <img
                src={
                  previewImage ||
                  "https://pearlss4development.org/wp-content/uploads/2020/05/profile-placeholder.jpg"
                }
                alt="Profile Preview"
                className={styles.previewImage}
              />
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className={styles.uploadIcon} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              className={styles.input}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.locationWrapper}>
            <input
              className={styles.input}
              value={formData.address}
              onChange={handleLocationInputChange}
              placeholder="Enter your location"
            />
            {locationSuggestions.length > 0 && (
              <div className={styles.suggestionsList}>
                {locationSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={styles.suggestionItem}
                    onClick={() => handleLocationSelect(suggestion)}
                  >
                    {suggestion.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading && <span className={styles.loadingSpinner} />}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </>
    </div>
  );
};

export default EditProfileModal;
