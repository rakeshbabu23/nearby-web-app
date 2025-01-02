// Range.jsx
import React from "react";
import Chip from "../../../../components/main/chip/Chip";
import styles from "./Range.module.css";
import { useAuth2 } from "../../../../contexts/User/UserContext";

const ranges = ["10km", "25km", "50km"];
const Range = () => {
  const { range, setRange } = useAuth2();
  // const [selectedRange, setSelectedRange] = useState("10km");

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Range</h3>
      <div className={styles.container}>
        {ranges.map((dist) => (
          <Chip
            key={dist}
            isSelected={range === dist}
            onClick={() => setRange(dist)}
          >
            {dist}
          </Chip>
        ))}
      </div>
    </div>
  );
};

export default Range;
