"use client";

import styles from "./profile.module.css";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import AuthComponent from "../AuthComponent/AuthComponent";

export default function ProfileCreationComponent() {
  const [stepperIndex, setStepperIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    shift: "",
    mainEquipment: "",
    secondaryEquipment: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { session } = useAuth();
  const { createProfile } = useData();

  const shiftNames = ["I", "J", "K", "L"];
  const equipmentTypes = [
    { type: "Truck", icon: <img src="/dump-truck.png" alt="Truck" className={styles.iconImg} /> },
    { type: "Grader", icon:  <img src="/grader.png" alt="Grader" className={styles.iconImg} /> },
    { type: "Bulldozer", icon: <img src="/bulldozer.png" alt="Bulldozer" className={styles.iconImg} /> },
    { type: "Loader", icon: <img src="/loader.png" alt="Loader" className={styles.iconImg} /> },
    { type: "Tiger", icon: <img src="/tiger.png" alt="Tiger" className={styles.iconImg} /> }, // Keeping tiger for character
    { type: "Excavator", icon: <img src="/excavator.png" alt="Excavator" className={styles.iconImg} /> },
    { type: "Shovel", icon: <img src="/shovel.png" alt="Shovel" className={styles.iconImg} /> },
    { type: "Utility", icon: <img src="/utility.png" alt="utility" className={styles.iconImg} /> },
    { type: "Drainage", icon: <img src="/drainage.png" alt="drainage" className={styles.iconImg} /> },
    
    
    
  ];

  if (!session) {
    return <AuthComponent />;
  }

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSecondaryEquipment = (equipment) => {
    setFormData((prev) => {
      const current = prev.secondaryEquipment;
      const exists = current.includes(equipment);
      return {
        ...prev,
        secondaryEquipment: exists
          ? current.filter((e) => e !== equipment)
          : [...current, equipment],
      };
    });
  };

  const isStepValid = () => {
    switch (stepperIndex) {
      case 0:
        return formData.firstName.trim() && formData.lastName.trim();
      case 1:
        return formData.shift;
      case 2:
        return formData.mainEquipment;
      default:
        return true;
    }
  };

  const renderStepper = () => (
    <div className={styles.stepper}>
      {[0, 1, 2, 3].map((idx) => (
        <div
          key={idx}
          className={`${styles.stepIcon} ${
            stepperIndex === idx ? styles.active : ""
          } ${stepperIndex > idx ? styles.completed : ""}`}
        >
          {stepperIndex > idx ? "✓" : idx + 1}
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      {renderStepper()}

      <div className={styles.stepCard}>
        {stepperIndex === 0 && (
          <>
            <div className={styles.header}>
              <h2>Personal Details</h2>
              <p>Let's start with your name.</p>
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.field}>
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {stepperIndex === 1 && (
          <>
            <div className={styles.header}>
              <h2>Select Your Shift</h2>
              <p>Which rotation are you currently on?</p>
            </div>
            <div className={styles.grid}>
              {shiftNames.map((shift) => (
                <button
                  key={shift}
                  className={`${styles.selectionBtn} ${
                    formData.shift === shift ? styles.selected : ""
                  }`}
                  onClick={() => updateField("shift", shift)}
                >
                  <span className={styles.label}>Shift {shift}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {stepperIndex === 2 && (
          <>
            <div className={styles.header}>
              <h2>Main Equipment</h2>
              <p>Select the primary machine you operate.</p>
            </div>
            <div className={styles.grid}>
              {equipmentTypes.map((eq) => (
                <button
                  key={eq.type}
                  className={`${styles.selectionBtn} ${
                    formData.mainEquipment === eq.type ? styles.selected : ""
                  }`}
                  onClick={() => updateField("mainEquipment", eq.type)}
                >
                  <span className={styles.icon}>{eq.icon}</span>
                  <span className={styles.label}>{eq.type}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {stepperIndex === 3 && (
          <>
            <div className={styles.header}>
              <h2>Secondary Skills</h2>
              <p>Any other equipment you're qualified to operate?</p>
            </div>
            <div className={styles.grid}>
              {equipmentTypes
                .filter((eq) => eq.type !== formData.mainEquipment)
                .map((eq) => (
                  <button
                    key={eq.type}
                    className={`${styles.selectionBtn} ${
                      formData.secondaryEquipment.includes(eq.type)
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => toggleSecondaryEquipment(eq.type)}
                  >
                    <span className={styles.icon}>{eq.icon}</span>
                    <span className={styles.label}>{eq.type}</span>
                  </button>
                ))}
            </div>
          </>
        )}

        <div className={styles.navigation}>
          {stepperIndex > 0 ? (
            <button
              className={styles.backBtn}
              onClick={() => setStepperIndex(stepperIndex - 1)}
            >
              Back
            </button>
          ) : (
            <div />
          )}
          <button
            className={styles.nextBtn}
            disabled={!isStepValid() || isSubmitting}
            onClick={async () => {
              if (stepperIndex < 3) {
                setStepperIndex(stepperIndex + 1);
              } else {
                setIsSubmitting(true);
                setError(null);
                const { success, error } = await createProfile(formData);
                if (success) {
                  window.dispatchEvent(new CustomEvent('navigate', { detail: 'crew' }));
                } else {
                  setError(error?.message || "Failed to create profile. Please try again.");
                  setIsSubmitting(false);
                }
              }
            }}
          >
            {isSubmitting ? (
              <span className={styles.submitLoader}></span>
            ) : (
              stepperIndex === 3 ? "Complete Profile" : "Next"
            )}
          </button>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
}
