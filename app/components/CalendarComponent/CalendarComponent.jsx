"use client"
import styles from "./calendar.module.css"
import { useData } from "../../context/DataContext"
import { useState, useEffect } from "react"
import { getShiftForDate, shiftSchema, shiftIndex, startingDate } from "../../lib/shiftUtils"

export default function CalendarComponent() {
  const { data, currentUser } = useData()
  const today = new Date()

  const [viewType, setViewType] = useState('monthly') // 'monthly' | 'yearly'
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth())
  const [selectedShift, setSelectedShift] = useState(currentUser?.shift?.toUpperCase() || null) // 'I', 'J', 'K', 'L'

  const [showHolidays, setShowHolidays] = useState(false)
  const [showPaydays, setShowPaydays] = useState(false)
  const [holidays, setHolidays] = useState({})
  const [selectedHoliday, setSelectedHoliday] = useState(null)

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const res = await fetch(`https://canada-holidays.ca/api/v1/provinces/AB?year=${selectedYear}`);
        const data = await res.json();
        if (data && data.province && data.province.holidays) {
          const holMap = {};
          data.province.holidays.forEach(h => {
            holMap[h.date] = h.nameEn || h.name; // Use proper key from Canada Holidays API
          });
          setHolidays(holMap);
        }
      } catch (err) {
        console.error("Failed to fetch holidays", err);
      }
    }
    if (showHolidays) {
      fetchHolidays();
    }
  }, [selectedYear, showHolidays])

  const payDayStartingDate = "2026-01-06"

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const isToday = (year, month, day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  const getShiftForDateInternal = (year, month, day) => {
    const current = new Date(year, month, day);
    return getShiftForDate(current, selectedShift);
  }

  const isPayDay = (year, month, day) => {
    const [sYear, sMonth, sDay] = payDayStartingDate.split("-").map(Number);
    const start = Date.UTC(sYear, sMonth - 1, sDay);
    const current = Date.UTC(year, month, day);
    const msPerDay = 1000 * 60 * 60 * 24;
    const delta = Math.round((current - start) / msPerDay);
    return delta % 14 === 0;
  }

  const PayDayIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.paydayIcon}>
      <rect x="2" y="8" width="20" height="12" rx="2" fill="#ecfdf5" />
      <circle cx="12" cy="14" r="2" />
      <path d="M6 14h.01M18 14h.01" strokeWidth="3" />
      <path d="M4 8v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" fill="#d1fae5" />
    </svg>
  );

  const StatHolidayIcon = ({ name, onClick }) => (
    <svg onClick={onClick} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.holidayIcon} title={name}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polygon points="12 12 13 14.5 15.5 14.5 13.5 16 14.5 18.5 12 17 9.5 18.5 10.5 16 8.5 14.5 11 14.5" fill="currentColor" />
    </svg>
  );

  const renderMonthGrid = (year, month, large = false) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-start-${i}`} className={`${styles.dayCell} ${styles.emptyCell} ${large ? styles.largeCell : ''}`}></div>)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isCurrentDay = isToday(year, month, d);
      const shiftCurrent = getShiftForDateInternal(year, month, d);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holidayText = holidays[dateKey];
      const isPay = showPaydays && isPayDay(year, month, d);

      let shiftThemeClass = "";
      let shiftLabel = null;
      let isIcon = false;

      if (shiftCurrent === "Day Shift") {
        shiftThemeClass = styles.dayShift;
        shiftLabel = "☀";
        isIcon = true;
      } else if (shiftCurrent === "Night Shift") {
        shiftThemeClass = styles.nightShift;
        shiftLabel = "🌙";
        isIcon = true;
      } else if (shiftCurrent === "Day Off") {
        shiftLabel = "OFF";
        isIcon = false;
      }

      let holidayClass = "";
      if (showHolidays && holidayText) {
        holidayClass = styles.holidayCell;
      }

      const todayClass = isCurrentDay ? styles.today : "";

      days.push(
        <div key={`day-${d}`} className={`${styles.dayCell} ${todayClass} ${large ? styles.largeCell : ''} ${shiftThemeClass} ${holidayClass}`}>
          <span className={styles.dayNumber}>{d}</span>
          {isPay && <PayDayIcon />}
          {selectedShift && (
            <span className={`${styles.shiftIndicator} ${large ? styles.shiftIndicatorLarge : ''} ${isIcon ? styles.shiftIconBig : ''}`}>{shiftLabel}</span>
          )}
          {showHolidays && holidayText && (
            <StatHolidayIcon name={holidayText} onClick={(e) => { e.stopPropagation(); setSelectedHoliday({date: dateKey, name: holidayText}); }} />
          )}
        </div>
      )
    }

    const currentCells = days.length;
    for (let i = 0; i < 42 - currentCells; i++) {
      days.push(<div key={`empty-end-${i}`} className={`${styles.dayCell} ${styles.emptyCell} ${large ? styles.largeCell : ''}`}></div>)
    }

    return (
      <div className={`${styles.monthCard} animate-fade-in`}>
        <div className={styles.monthTitle}>{months[month]} {large && year}</div>
        <div className={styles.monthGrid}>
          {daysOfWeek.map(d => <div key={d} className={styles.dayOfWeek}>{d}</div>)}
          {days}
        </div>
      </div>
    )
  }

  const years = []
  for (let y = today.getFullYear() - 5; y <= today.getFullYear() + 5; y++) {
    years.push(y)
  }

  const handleShiftToggle = (shiftLetter) => {
    setSelectedShift(prev => prev === shiftLetter ? null : shiftLetter);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.segmentedGroup}>
            <button 
              className={`${styles.segmentBtn} ${viewType === 'monthly' ? styles.active : ''}`}
              onClick={() => setViewType('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`${styles.segmentBtn} ${viewType === 'yearly' ? styles.active : ''}`}
              onClick={() => setViewType('yearly')}
            >
              Yearly
            </button>
          </div>

          <div className={styles.dateSelectors}>
            {viewType === 'monthly' && (
              <select className={styles.select} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            )}
            <select className={styles.select} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.headerBottom}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Shift Pattern</span>
            <div className={styles.segmentedGroup}>
              {['I', 'J', 'K', 'L'].map(shift => (
                 <button 
                   key={shift} 
                   className={`${styles.segmentBtn} ${selectedShift === shift ? styles.active : ''}`} 
                   onClick={() => handleShiftToggle(shift)}
                 >
                   {shift}
                 </button>
              ))}
            </div>
          </div>
          
          <div className={`${styles.filterGroup} ${styles.switchGroup}`}>
             <label className={styles.switchLabel}>
               <span>AB Holidays</span>
               <input type="checkbox" checked={showHolidays} onChange={e => setShowHolidays(e.target.checked)} className={styles.switchInput}/>
             </label>
             <label className={styles.switchLabel}>
               <span>Pay Days</span>
               <input type="checkbox" checked={showPaydays} onChange={e => setShowPaydays(e.target.checked)} className={styles.switchInput}/>
             </label>
          </div>
        </div>
      </div>

      <div className={styles.calendarArea}>
        {viewType === 'monthly' ? (
          <div className={styles.singleMonthContainer}>
            {renderMonthGrid(selectedYear, selectedMonth, true)}
          </div>
        ) : (
          <div className={styles.yearlyGrid}>
            {months.map((_, i) => (
              <div key={i}>
                {renderMonthGrid(selectedYear, i)}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedHoliday && (() => {
        const getHolidayFact = (name) => {
          const lower = name.toLowerCase();
          if (lower.includes("new year")) return "The earliest recorded festivities in honor of a new year's arrival date back some 4,000 years to ancient Babylon.";
          if (lower.includes("family")) return "Alberta was the very first province to legally adopt Family Day back in 1990 to emphasize the importance of home values.";
          if (lower.includes("good friday")) return "The exact date of Good Friday is strictly tied to the lunar calendar, causing its date to shift dramatically between March and April.";
          if (lower.includes("victoria")) return "Established all the way back in 1845 to honor Queen Victoria's birthday, it's often considered by Canadians as the unofficial start of summer!";
          if (lower.includes("canada") || lower.includes("dominion")) return "Originally called Dominion Day until 1982, this day commemorates the joining of Canada's original properties into one unified nation in 1867.";
          if (lower.includes("labour") || lower.includes("labor")) return "Labour Day actually traces its origins directly to the 1872 Toronto printers' strike which successfully led to the decriminalization of trade unions in Canada.";
          if (lower.includes("thanksgiving")) return "Did you know: Unlike the US, Canadian Thanksgiving is held in October and is originally rooted in the 1578 safe voyage of Martin Frobisher in Nunavut.";
          if (lower.includes("remembrance")) return "Dedicated solemnly on the 11th hour of the 11th day of the 11th month to recall the absolute end of hostilities of World War I in 1918.";
          if (lower.includes("christmas")) return "The very first recorded date of Christmas being officially celebrated on December 25th was in 336 AD, far back under Roman Emperor Constantine.";
          return "This is a recognized statutory or optional general holiday in Alberta. Premium pay rates or time off in lieu generally apply!";
        };

        return (
          <div className={styles.modalOverlay} onClick={() => setSelectedHoliday(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{selectedHoliday.name}</h3>
                <button className={styles.closeBtn} onClick={() => setSelectedHoliday(null)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <p><strong>Date:</strong> {selectedHoliday.date}</p>
                <p>{getHolidayFact(selectedHoliday.name)}</p>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}