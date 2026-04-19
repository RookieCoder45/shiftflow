"use client";

import { useState, useEffect } from "react";
import styles from "./CoverageRequest.module.css";
import ReturnHomeComponent from "./ReturnHomeComponent";
import CalendarManagement from "./CalendarManagement";
import { useData } from "@/app/context/DataContext";
import { useAuth } from "@/app/context/AuthContext";

export default function OfferCoverageComponent({ onNavigate }) {
  const { currentUser, updateProfileDates } = useData();
  const { loading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [offerCoverage, setOfferCoverage] = useState({
    sliderIndex: 0,
    shift: "",
    user_id: "",
    first_name: "",
    last_name: "",
    main_equipment: "",
    available_to_work_dates: [],
    typeOfMutuals: "",
    cashAmount: "",
  });

  // ✅ Populate user data once loaded
  useEffect(() => {
    if (!currentUser) return;

    setOfferCoverage((prev) => ({
      ...prev,
      shift: currentUser.shift,
      user_id: currentUser.id,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      main_equipment: currentUser.main_equipment,
    }));
  }, [currentUser]);

  // ✅ Navigation helper
  const goToStep = (step) => {
    setOfferCoverage((prev) => ({ ...prev, sliderIndex: step }));
  };

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (!offerCoverage.available_to_work_dates.length) return;

    setIsSubmitting(true);

    try {
      const isCash = offerCoverage.typeOfMutuals === "Cash";
      const column = isCash
        ? "available_to_work_dates_cash"
        : "available_to_work_dates_payback";

      const existingDates = currentUser[column] || [];

      const mergedDates = [
        ...new Set([
          ...existingDates,
          ...offerCoverage.available_to_work_dates,
        ]),
      ].sort();

      await updateProfileDates(currentUser.id, column, mergedDates);

      alert("Coverage Offer Submitted!");
      onNavigate("home");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Loading guard (CRITICAL)
  if (authLoading || !currentUser) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Offer Coverage</h1>

      <div className={styles.sliderContainer}>
        <div className={styles.slider}>
          <div className={styles.sliderItem}>

            {/* STEP 0 */}
            {offerCoverage.sliderIndex === 0 && (
              <div className={styles.card}>
                <div className={styles.cardTop}>
                  <h2>
                    {offerCoverage.first_name} {offerCoverage.last_name}
                  </h2>

                  <p style={{ color: "var(--text-secondary)" }}>
                    Your profile information
                  </p>

                  <div className={styles.infoBox}>
                    <p>
                      <strong>Shift:</strong> {offerCoverage.shift}
                    </p>
                    <p>
                      <strong>Main Equipment:</strong>{" "}
                      {offerCoverage.main_equipment}
                    </p>
                  </div>
                </div>

                <div className={styles.btnContainer}>
                  <button
                    className={styles.nextBtn}
                    onClick={() => goToStep(1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1 */}
            {offerCoverage.sliderIndex === 1 && (
              <div className={styles.card}>
                <CalendarManagement
                  startFresh
                  initialSelectionMode="available"
                  onDatesChange={(mode, dates) => {
                    if (mode === "available") {
                      setOfferCoverage((prev) => ({
                        ...prev,
                        available_to_work_dates: dates,
                      }));
                    }
                  }}
                />

                <div className={styles.btnContainer}>
                  <button
                    className={styles.prevBtn}
                    onClick={() => goToStep(0)}
                  >
                    Previous
                  </button>

                  <button
                    className={styles.nextBtn}
                    disabled={!offerCoverage.available_to_work_dates.length}
                    onClick={() => goToStep(2)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {offerCoverage.sliderIndex === 2 && (
              <div className={styles.card}>
                <h2>Coverage Type</h2>

                <div className={styles.btnContainer}>
                  <button
                    className={styles.cashBtn}
                    onClick={() =>
                      setOfferCoverage((prev) => ({
                        ...prev,
                        typeOfMutuals: "Cash",
                        sliderIndex: 3,
                      }))
                    }
                  >
                    Cash
                  </button>

                  <button
                    className={styles.payBackBtn}
                    onClick={() =>
                      setOfferCoverage((prev) => ({
                        ...prev,
                        typeOfMutuals: "Pay Back",
                        sliderIndex: 4,
                      }))
                    }
                  >
                    Pay Back
                  </button>
                </div>

                <button
                  className={styles.prevBtn}
                  onClick={() => goToStep(1)}
                >
                  Previous
                </button>
              </div>
            )}

            {/* STEP 3 */}
            {offerCoverage.sliderIndex === 3 && (
              <div className={styles.card}>
                <h2>Cash Amount</h2>

                <input
                  type="text"
                  placeholder="$0"
                  value={offerCoverage.cashAmount}
                  onChange={(e) =>
                    setOfferCoverage((prev) => ({
                      ...prev,
                      cashAmount: e.target.value,
                    }))
                  }
                  className={styles.input}
                />

                <div className={styles.btnContainerColumn}>
                  <button
                    className={styles.nextBtn}
                    onClick={() => goToStep(4)}
                  >
                    {offerCoverage.cashAmount ? "Continue" : "Skip"}
                  </button>

                  <button
                    className={styles.prevBtn}
                    onClick={() => goToStep(2)}
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {offerCoverage.sliderIndex === 4 && (
              <div className={styles.card}>
                <h2>Confirm Offer</h2>

                <div className={styles.summaryBox}>
                  <p>
                    <strong>Shift:</strong> {offerCoverage.shift}
                  </p>
                  <p>
                    <strong>Equipment:</strong>{" "}
                    {offerCoverage.main_equipment}
                  </p>
                  <p>
                    <strong>Dates:</strong>{" "}
                    {offerCoverage.available_to_work_dates.length} selected
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    {offerCoverage.typeOfMutuals}
                    {offerCoverage.typeOfMutuals === "Cash" &&
                      offerCoverage.cashAmount &&
                      ` ($${offerCoverage.cashAmount})`}
                  </p>
                </div>

                <div className={styles.btnContainer}>
                  <button
                    className={styles.prevBtn}
                    onClick={() =>
                      goToStep(
                        offerCoverage.typeOfMutuals === "Cash" ? 3 : 2
                      )
                    }
                    disabled={isSubmitting}
                  >
                    Previous
                  </button>

                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !offerCoverage.available_to_work_dates.length
                    }
                  >
                    {isSubmitting ? "Broadcasting..." : "Broadcast Offer"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <ReturnHomeComponent onNavigate={onNavigate} />
    </div>
  );
}