// Topics.jsx
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import Chip from "../../../../components/main/chip/Chip";
import styles from "./Topics.module.css";
import { useAuth2 } from "../../../../contexts/User/UserContext";
import Loader from "../../../../components/general/loader/Loader";

const Topics = () => {
  const { allTags, selectedTags, setSelectedTags, tagsLoading } = useAuth2();
  const [isExpanded, setIsExpanded] = useState(true);
  //const [selectedTopics, setSelectedTopics] = useState(selectedTags);

  const toggleTopic = (topic) => {
    setSelectedTags((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    //postRefetch();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Topics</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse topics" : "Expand topics"}
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.container}>
          {tagsLoading ? (
            <Loader />
          ) : allTags && allTags.length === 0 ? (
            <div className={styles.noTags}>
              <p>No tags found in specified range</p>
            </div>
          ) : (
            allTags?.map(
              (topic) =>
                topic.length > 0 && (
                  <Chip
                    key={topic}
                    isSelected={selectedTags.includes(topic)}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Chip>
                )
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Topics;
