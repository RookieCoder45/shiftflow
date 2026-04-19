import styles from "./MutualPosts.module.css";
import { useData } from "../../context/DataContext";
import AnimatedList from "./AnimatedList";
import { useState } from "react";

export default function MutualPosts() {
  const { data } = useData();
  const [filterIsClicked, setFilterIsClicked] = useState(false);

  const [filterByShift, setFilterByShift] = useState("");
  const [filterByEquipment, setFilterByEquipment] = useState("");
  const shifts = ["I", "J", "K", "L"];
  const equipmentTypes = [
    "Truck",
    "Grader",
    "Bulldozer",
    "Tiger",
    "Excavator",
    "Shovel",
    "Utility",
    "Drainage",
  ];

  if (!data) {
    return <div className={styles.container}>Loading...</div>;
  }

  const toggleFilters = () => {
    setFilterIsClicked((prev) => !prev);
  };

  const handleButtonPress = (value) => {
    if (value.length === 1) {
      setFilterByShift((prev) => (prev === value ? "" : value));
    } else {
      setFilterByEquipment((prev) => (prev === value ? "" : value));
    }
  };

  // ✅ FILTER FIRST
  const filteredPosts = data
    .filter((item) => {
      return (
        (!filterByShift || item.shift === filterByShift) &&
        (!filterByEquipment || item.main_equipment === filterByEquipment)
      );
    })
    .map((item) => {
      const hasCash = item.need_coverage_cash_dates?.length > 0;
      const hasPayback = item.need_coverage_payback_dates?.length > 0;

      return (
        <div className={styles.postContent} key={item.id}>
          {" "}
          <div className={styles.postHeader}>
            {" "}
            <h3 className={styles.postName}>
              {item.first_name} {item.last_name}
            </h3>{" "}
            <span className={styles.postShift}>{item.shift} Shift</span>{" "}
          </div>{" "}
          <div className={styles.postBody}>
            {" "}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {" "}
              <span className={styles.equipLabel}>Equipment</span>{" "}
              <span className={styles.equipValue}>
                {item.main_equipment}
              </span>{" "}
            </div>{" "}
            {(hasCash || hasPayback ) && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px dashed var(--border-color)",
                }}
              >
                {" "}
                {hasCash && (
                  <span
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                    }}
                  >
                    Offering Cash 💸
                  </span>
                )}{" "}
                {hasPayback && (
                  <span
                    style={{
                      background: "#f59e0b",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                    }}
                  >
                    Looking to Trade 🔄
                  </span>
                )}{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>
      );
    });

  return (
    <div className={styles.container}>
      {!filterIsClicked && (
        <div
          className={styles.filter}
          onClick={() => {
            toggleFilters();
          }}
        >
          <p>Filter options: </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <title xmlns="">filter</title>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="1.5"
              d="M21.25 12H8.895m-4.361 0H2.75m18.5 6.607h-5.748m-4.361 0H2.75m18.5-13.214h-3.105m-4.361 0H2.75m13.214 2.18a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm-9.25 6.607a2.18 2.18 0 1 0 0-4.36a2.18 2.18 0 0 0 0 4.36Zm6.607 6.608a2.18 2.18 0 1 0 0-4.361a2.18 2.18 0 0 0 0 4.36Z"
            />
          </svg>
        </div>
      )}
      {filterIsClicked && (
        <div className={`${styles.filterOptions} `}>
          {shifts.map((shift, index) => (
            <button
              type="button"
              key={index}
              className={` ${filterByShift === shift ? styles.active : ""}`}
              onClick={() => handleButtonPress(shift)}
            >
              {shift}
            </button>
          ))}
          {equipmentTypes.map((type, index) => (
            <button
              type="button"
              key={index}
              className={` ${filterByEquipment === type ? styles.active : ""}`}
              onClick={() => handleButtonPress(type)}
            >
              {type}
            </button>
          ))}
          <svg
            onClick={() => {
              toggleFilters();
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
          >
            <title xmlns="">close-circle-line</title>
            <path
              fill="currentColor"
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16m0-9.414l2.828-2.829l1.415 1.415L13.414 12l2.829 2.828l-1.415 1.415L12 13.414l-2.828 2.829l-1.415-1.415L10.586 12L7.757 9.172l1.415-1.415z"
            />
          </svg>
        </div>
      )}

      <AnimatedList items={filteredPosts} />
    </div>
  );
}
