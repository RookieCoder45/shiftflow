"use client"

import styles from "./profile.module.css"
import { useData } from "../../context/DataContext"
import { useAuth } from "../../context/AuthContext"
import AuthComponent from "../AuthComponent/AuthComponent"
import { useState, useEffect } from "react"
import { getShiftForDate, getShiftIcon } from "../../lib/shiftUtils"

export default function ProfileComponent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { currentUser, updateShift, updateProfileDates, setActiveMatchContext, loading: dataLoading } = useData()
  const [isUpdating, setIsUpdating] = useState(false)
  const [newDate, setNewDate] = useState({ available: "", coverage: "" })
  const [localDates, setLocalDates] = useState({ available: [], coverage: [] })
  
  // Calendar State
  const [currentViewDate, setCurrentViewDate] = useState(new Date())
  const [selectionMode, setSelectionMode] = useState('available') // 'available' | 'coverage'

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  useEffect(() => {
    if (currentUser) {
      setLocalDates({
        available: currentUser.available_to_work_dates || [],
        coverage: currentUser.need_coverage_dates || []
      })
    }
  }, [currentUser])

  useEffect(() => {
    document.title = "ShiftFlow | Profile"
  }, [])

  if (authLoading || dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Syncing Profile Data...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthComponent />
  }

  if (!currentUser) {
    return (
      <div className={styles.noProfileContainer}>
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyIcon}>👤</div>
          <h2>No Profile Found</h2>
          <p>It looks like you haven't set up your ShiftFlow profile yet.</p>
          <button 
            className={styles.primaryBtn}
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'profileCreation' }))}
          >
            Create Profile Now
          </button>
        </div>
      </div>
    )
  }

  const handleShiftChange = async (newShift) => {
    setIsUpdating(true)
    await updateShift(currentUser.id, newShift)
    setIsUpdating(false)
  }

  const handleAddLocal = (type) => {
    if (!newDate[type]) return
    if (localDates[type].includes(newDate[type])) return

    setLocalDates(prev => ({
      ...prev,
      [type]: [...prev[type], newDate[type]].sort()
    }))
    setNewDate(prev => ({ ...prev, [type]: "" }))
  }

  const handleRemoveLocal = (type, dateToRemove) => {
    setLocalDates(prev => ({
      ...prev,
      [type]: prev[type].filter(d => d !== dateToRemove)
    }))
  }

  const handleSaveDates = async () => {
    setIsUpdating(true)
    const res1 = await updateProfileDates(currentUser.id, "available_to_work_dates", localDates.available)
    const res2 = await updateProfileDates(currentUser.id, "need_coverage_dates", localDates.coverage)
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
    if (localDates[selectionMode].includes(dateStr)) {
      // Remove if exists
      setLocalDates(prev => ({
        ...prev,
        [selectionMode]: prev[selectionMode].filter(d => d !== dateStr)
      }));
    } else {
      // Add if valid for mode
      if (selectionMode === 'available' && shiftType === "Day Off") {
        setLocalDates(prev => ({
          ...prev,
          available: [...prev.available, dateStr].sort()
        }));
      } else if (selectionMode === 'coverage' && shiftType !== "Day Off") {
        setLocalDates(prev => ({
          ...prev,
          coverage: [...prev.coverage, dateStr].sort()
        }));
      }
    }
  }

  const changeMonth = (delta) => {
    const newView = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + delta, 1);
    
    // Prevent navigating too far back or forward
    const today = new Date();
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear() + 1, today.getMonth() + 1, 0);
    
    if (newView < minMonth && delta < 0) return;
    if (newView > maxMonth && delta > 0) return;

    setCurrentViewDate(newView);
  }




 
  return (
    <div className={styles.container}>
      {/* Identity Banner */}
      <section className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBig}>
            {currentUser.first_name ? currentUser.first_name.charAt(0) : user.email.charAt(0).toUpperCase()}
          </div>
          <div className={styles.avatarPinner}>
            <span>✓</span>
          </div>
        </div>
        <div className={styles.headerInfo}>
          <h1 className={styles.userName}>{currentUser.first_name + " " + currentUser.last_name || user.email.split('@')[0]}</h1>
          <div className={styles.badgeRow}>
            <span className={styles.badge}>{currentUser.main_equipment}</span>
            <span className={styles.statusDot}></span>
            <span className={styles.statusText}>Active Now</span>
            <div className={styles.headerActions}>
           <button onClick={signOut} className={`${styles.logoutBtn} ${styles.primaryBtn}`}>Sign Out</button>
        </div>
          </div>
        </div>
        
      </section>

      <section className={styles.mainGrid}>
        {/* Availability Controls */}
        <div className={styles.glassCard}>
          <div className={styles.cardHeader}>
            <h3>Calendar Management</h3>
            <p>Track your availability and coverage requests.</p>
          </div>

          <div className={styles.calendarDashboard}>
            {/* Calendar Widget */}
            <div className={styles.calendarWidget}>
              <div className={styles.calendarHeader}>
                <div className={styles.modeToggle}>
                  <button 
                    className={`${styles.modeBtn} ${selectionMode === 'available' ? styles.activeAvailable : ""}`}
                    onClick={() => setSelectionMode('available')}
                  >
                    Available for Mutuals
                  </button>
                  <button 
                    className={`${styles.modeBtn} ${selectionMode === 'coverage' ? styles.activeCoverage : ""}`}
                    onClick={() => setSelectionMode('coverage')}
                  >
                    Need Coverage
                  </button>
                </div>
                
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

              {localDates.coverage.length > 0 && (
                <div className={styles.coverageListSection}>
                  <label className={styles.miniLabel}>Requested Coverage</label>
                  <div className={styles.coverageList}>
                    {localDates.coverage.map(date => (
                      <div key={date} className={styles.coverageItem}>
                        <span>{new Date(date + 'T00:00:00').toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                        <button 
                          className={styles.matchBtn}
                          onClick={() => {
                            setActiveMatchContext({
                              date: date,
                              equipment: currentUser.main_equipment
                            });
                            window.dispatchEvent(new CustomEvent('navigate', { detail: 'crew' }));
                          }}
                        >
                          Find Match 🔍
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.cardFooter}>
            <button 
              className={styles.saveBtn} 
              onClick={handleSaveDates}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save List to Database"}
            </button>
          </div>
        </div>

        {/* Shift Dashboard */}
        <div className={`${styles.glassCard} ${styles.shiftDashboard}`}>
          <div className={styles.cardHeader}>
            <h3>Shift Dashboard</h3>
            <p>Your active rotational pattern and live status.</p>
          </div>

          <div className={styles.liveStatus}>
            <div className={styles.todayIndicator}>
              <span className={styles.indicatorLabel}>Today's Status</span>
              <div className={styles.statusBig}>
                <span className={styles.statusIcon}>
                  {getShiftIcon(getShiftForDate(new Date(), currentUser.shift))}
                </span>
                <span className={styles.statusType}>
                  {getShiftForDate(new Date(), currentUser.shift) || "No Shift Set"}
                </span>
              </div>
            </div>

          </div>
          {isUpdating && <div className={styles.updatingOverlay}>Updating...</div>}
        </div>
      </section>
    </div>
  )
}
