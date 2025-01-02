import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import Person from "./Person";
import styles from "./People.module.css";
import { useAuth2 } from "../../../../contexts/User/UserContext";
import Loader from "../../../../components/general/loader/Loader";

const People = ({ setShowChatModal }) => {
  const { people, peopleLoading, range } = useAuth2();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>People in {range} radius</h3>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={
            isExpanded ? "Collapse people list" : "Expand people list"
          }
        >
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.container}>
          {peopleLoading ? (
            <Loader />
          ) : people && people.length < 1 ? (
            <p
              style={{
                fontFamily: "Poppins",
                fontWeight: 500,
                marginTop: "20px",
                color: "#888",
              }}
            >
              No people found
            </p>
          ) : (
            people?.map((person, index) => (
              <Person
                person={person}
                key={index}
                profileImage={person.profileImage}
                name={person.personName}
                setShowChatModal={setShowChatModal}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default People;
