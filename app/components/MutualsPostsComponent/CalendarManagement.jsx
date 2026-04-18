"use client"

import styles from "../ProfileComponent/profile.module.css"
import { useData } from "../../context/DataContext"
import { useState, useEffect } from "react"
import { getShiftForDate, getShiftIcon } from "../../lib/shiftUtils"

export default function CalendarManagement({ onDatesChange, startFresh = false, initialSelectionMode = 'coverage' }) {
  const { currentUser, updateProfileDates, setActiveMatchContext } = useData()
  const [isUpdating, setIsUpdating] = useState(false)
  const [localDates, setLocalDates] = useState({ available: [], coverage: [] })
  
  // Calendar State
  const [currentViewDate, setCurrentViewDate] = useState(new Date())
  const [selectionMode, setSelectionMode] = useState(initialSelectionMode) // 'available' | 'coverage'

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  useEffect(() => {
    if (currentUser) {
      if (startFresh) {
        setLocalDates({ available: [], coverage: [] })
      } else {
        setLocalDates({
          available: currentUser.available_to_work_dates || [],
          coverage: currentUser.need_coverage_dates || []
        })
      }
    }
  }, [currentUser, startFresh])

  const handleSaveDates = async () => {
    setIsUpdating(true)
    await updateProfileDates(currentUser.id, "available_to_work_dates", localDates.available)
    await updateProfileDates(currentUser.id, "need_coverage_dates", localDates.coverage)
    setIsUpdating(false)
  }

  // Calendar Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  const handleDayClick = (dayNum) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    const clickedDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), dayNum);
    const dateStr = formatDate(clickedDate);
    const shiftType = getShiftForDate(clickedDate, currentUser.shift);

    // Date Constraints: No past dates, no dates beyond 12 months
    if (clickedDate < today || clickedDate > maxDate) return;

    // Toggle Logic
    let newDates = [];
    if (localDates[selectionMode].includes(dateStr)) {
      newDates = localDates[selectionMode].filter(d => d !== dateStr);
      setLocalDates(prev => ({
        ...prev,
        [selectionMode]: newDates
      }));
    } else {
      if (selectionMode === 'available' && shiftType === "Day Off") {
        newDates = [...localDates.available, dateStr].sort();
        setLocalDates(prev => ({
          ...prev,
          available: newDates
        }));
      } else if (selectionMode === 'coverage' && shiftType !== "Day Off") {
        newDates = [...localDates.coverage, dateStr].sort();
        setLocalDates(prev => ({
          ...prev,
          coverage: newDates
        }));
      } else {
        return; // invalid selection
      }
    }
    
    if (onDatesChange) {
      onDatesChange(selectionMode, newDates);
    }
  }

  const changeMonth = (delta) => {
    const newView = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + delta, 1);
    const today = new Date();
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear() + 1, today.getMonth() + 1, 0);
    
    if (newView < minMonth && delta < 0) return;
    if (newView > maxMonth && delta > 0) return;

    setCurrentViewDate(newView);
  }

  if (!currentUser) return null;

  return (
    <div className={styles.calendarDashboard}>
      <div className={styles.calendarWidget}>
        <div className={styles.calendarHeader}>
          <div className={styles.calendarNav}>
            <button onClick={() => changeMonth(-1)}>←</button>
            <h4>{months[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}</h4>
            <button onClick={() => changeMonth(1)}>→</button>
          </div>
        </div>
        
        <div className={styles.miniGrid}>
          {daysOfWeek.map(d => <div key={d} className={styles.dayOfWeek}>{d}</div>)}
          {Array.from({ length: getFirstDayOfMonth(currentViewDate.getFullYear(), currentViewDate.getMonth()) }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptyCell}></div>
          ))}
          {Array.from({ length: getDaysInMonth(currentViewDate.getFullYear(), currentViewDate.getMonth()) }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), dayNum);
            
            const shiftType = getShiftForDate(dateObj, currentUser.shift);
            const dateStr = formatDate(dateObj);
            const isAvailable = localDates.available.includes(dateStr);
            const isCoverage = localDates.coverage.includes(dateStr);

            const today = new Date();
            today.setHours(0,0,0,0);
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 1);
            const isOutOfRange = dateObj < today || dateObj > maxDate;
            
            let shiftClass = "";
            if (shiftType === "Day Shift") shiftClass = styles.dayShift;
            else if (shiftType === "Night Shift") shiftClass = styles.nightShift;
            else if (shiftType === "Day Off") shiftClass = styles.offShift;

            return (
              <div 
                key={dayNum} 
                className={`${styles.miniDay} ${shiftClass} ${isAvailable ? styles.hasAvailable : ""} ${isCoverage ? styles.hasCoverage : ""} ${isOutOfRange ? styles.isOutOfRange : ""}`}
                onClick={() => !isOutOfRange && handleDayClick(dayNum)}
              >
                <span className={styles.miniDayNum}>{dayNum}</span>
                <span className={styles.miniShiftIcon}>{getShiftIcon(shiftType)}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.selectionNote}>
          {selectionMode === 'available' 
            ? "Tap days off to mark as Available for Mutuals." 
            : "Tap working shifts to request Coverage."
          }
        </div>
      </div>
    </div>
  )
}
