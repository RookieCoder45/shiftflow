import styles from "./MutualPosts.module.css";
import { useData } from "../../context/DataContext";
import AnimatedList from "./AnimatedList";
import { useState, useEffect } from "react";
import {faker } from "@faker-js/faker";
import { motion } from "motion/react"


export default function MutualPosts() {
  const { data } = useData();
  const [filterIsClicked, setFilterIsClicked] = useState(false);
const[showDetailedCard, setShowDetailedCard] = useState(null)
  const [filterByShift, setFilterByShift] = useState("");
  const [filterByEquipment, setFilterByEquipment] = useState("");
  const [isMobile, setIsMobile] = useState(false);
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


  useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkMobile();
  window.addEventListener("resize", checkMobile);

  return () => window.removeEventListener("resize", checkMobile);
}, []);


function randomlyGenerateDate() {
  const bool = Math.random() < 0.5;

  if (bool) {
    return faker.date.past().toISOString().split("T")[0];
  } else {
    return null;
  }
}

 const [fakePosts] = useState(() =>
  Array.from({ length: 100 }, () => {
    const cashDate = randomlyGenerateDate();
    const paybackDate = randomlyGenerateDate();

    return {
      id: faker.string.uuid(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      shift: faker.helpers.arrayElement(["I", "J", "K", "L"]),
      main_equipment: faker.helpers.arrayElement([
        "Truck",
        "Grader",
        "Bulldozer",
        "Tiger",
        "Excavator",
        "Shovel",
        "Utility",
        "Drainage",
      ]),
      need_coverage_cash_dates: cashDate ? [cashDate] : [],
      need_coverage_payback_dates: paybackDate ? [paybackDate] : [],
    };
  })
);

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

  
  const showCard = (item) => {
    return (
      <div className={styles.card} key={item.id} style={{zIndex:"1000"}}>
        <div className={styles.cardHeader}>
          <h2>{item.first_name}<br/> {item.last_name}</h2>
        </div>
        <div className={styles.cardBody}>
          <p>Shift: {item.shift}</p>
          <p>Equipment: {item.main_equipment}</p>
          
        </div>
      </div>
    );
  }

  // ✅ FILTER FIRST
  const filteredPosts = [
    ...data, ...fakePosts]
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
        <div className={styles.postContent} key={item.id} onClick={() => setShowDetailedCard(item)}>
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
      {showDetailedCard && (
  <motion.div 
  
  className={styles.card}>
    <svg onClick={() => setShowDetailedCard(null)}
     xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><title xmlns="">close-outline</title><path fill="currentColor" d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07m1.41-1.41A8 8 0 1 0 15.66 4.34A8 8 0 0 0 4.34 15.66m9.9-8.49L11.41 10l2.83 2.83l-1.41 1.41L10 11.41l-2.83 2.83l-1.41-1.41L8.59 10L5.76 7.17l1.41-1.41L10 8.59l2.83-2.83z"/></svg>
    <h2>
      {showDetailedCard.first_name} {showDetailedCard.last_name}
    </h2>
    <p>Shift: {showDetailedCard.shift}</p>
    <p>Equipment: {showDetailedCard.main_equipment}</p>
    <br/>
    <hr/>
    <br/>
    <p>Cash Dates: {showDetailedCard.need_coverage_cash_dates?.join(", ")}</p>
    <br/>
    <hr/>
    <br/>
    <p>Payback Dates: {showDetailedCard.need_coverage_payback_dates?.join(", ")}</p>
  </motion.div>
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
