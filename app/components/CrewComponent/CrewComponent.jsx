"use client"

import { useState, useEffect } from "react"
import { useData } from "../../context/DataContext"
import { getShiftForDate, getShiftIcon } from "../../lib/shiftUtils"
import styles from "./crew.module.css"

export default function CrewComponent() {
  const { data: profiles, loading, currentUser, activeMatchContext, setActiveMatchContext, sendMessage } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [activeShiftFilter, setActiveShiftFilter] = useState(null)
  
  const handleSendMessage = async (receiverId) => {
    if (!messageContent.trim()) {
      alert("Please enter a message")
      return
    }
    
    setIsSending(true)
    let finalContent = messageContent
    let relatedDate = null
    
    if (activeMatchContext) {
      relatedDate = activeMatchContext.date
    }

    const res = await sendMessage(receiverId, finalContent, activeMatchContext ? "coverage_request" : "standard", relatedDate)
    
    setIsSending(false)
    if (res.success) {
      setMessageContent("")
      alert("Message Sent!")
      setSelectedMember(null)
    } else {
      alert("Failed to send message")
    }
  }

  const [activeEquipmentFilter, setActiveEquipmentFilter] = useState(null)
  const [dateFilterType, setDateFilterType] = useState("none") // "none" | "month" | "day"
  const [activeDateFilter, setActiveDateFilter] = useState("") // "YYYY-MM" or "YYYY-MM-DD"
  
  const [selectedMember, setSelectedMember] = useState(null)
  const [modalViewDate, setModalViewDate] = useState(new Date())

  // Smart Match Effect: Auto-populate filters if context is provided
  useEffect(() => {
    if (activeMatchContext && profiles) {
      console.log("Applying Smart Match context:", activeMatchContext)
      setActiveEquipmentFilter(activeMatchContext.equipment)
      setDateFilterType("day")
      setActiveDateFilter(activeMatchContext.date)
      // We don't clear the context yet so we can show the "Match Mode" banner
    }
  }, [activeMatchContext, profiles])

  const clearMatchMode = () => {
    setActiveMatchContext(null)
    setActiveEquipmentFilter(null)
    setDateFilterType("none")
    setActiveDateFilter("")
  }

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Sync modal date when selection changes
  useEffect(() => {
    if (selectedMember) {
      setModalViewDate(new Date())
    }
  }, [selectedMember])

  const shifts = ["I", "J", "K", "L"]

  // Fixed equipment categories for simplified filtering
  const equipmentOptions = [
    "Truck", "Grader", "Bulldozer", "Tiger", "Loader", 
    "Excavator", "Shovel", "Utility", "Drainage"
  ];

  const filteredProfiles = profiles?.filter(profile => {
    // 0. Exclude self
    if (currentUser && profile.id === currentUser.id) return false

    // 1. Search term (Name)
    const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())
    
    // 2. Shift (I, J, K, L)
    const matchesShift = activeShiftFilter ? profile.shift === activeShiftFilter : true
    
    // 3. Equipment (Including Hierarchical Qualification)
    let matchesEquipment = true
    if (activeEquipmentFilter) {
      const main = profile.main_equipment
      const secondary = Array.isArray(profile.secondary_equipment) ? profile.secondary_equipment : [profile.secondary_equipment]
      const hasSkillExplicitly = main === activeEquipmentFilter || secondary.includes(activeEquipmentFilter)
      
      // Implicit Truck Qualification: Advanced operators are always Truck qualified
      if (activeEquipmentFilter === "Truck") {
        const advancedMachinery = ["Dozer", "Bulldozer", "Grader", "Shovel", "Tiger", "Loader", "Excavator"]
        matchesEquipment = hasSkillExplicitly || advancedMachinery.includes(main)
      } else {
        matchesEquipment = hasSkillExplicitly
      }
    }
    
    // 4. Date Activity (Month or Day)
    let matchesDate = true
    if (activeDateFilter) {
      if (dateFilterType === "month") {
        const availCash = profile.available_to_work_dates_cash || []
        const availPay = profile.available_to_work_dates_payback || []
        const hasMonthActivity = [
          ...availCash,
          ...availPay,
          ...(profile.need_coverage_cash_dates || []),
          ...(profile.need_coverage_payback_dates || [])
        ].some(d => d.startsWith(activeDateFilter))
        matchesDate = hasMonthActivity
      } else if (dateFilterType === "day") {
        // If Smart Match is active, strictly show people who are "Available"
        if (activeMatchContext) {
          const availCash = profile.available_to_work_dates_cash || []
          const availPay = profile.available_to_work_dates_payback || []
          matchesDate = [...availCash, ...availPay].some(d => d.trim() === activeDateFilter)
        } else {
          // Normal day filter shows anyone with any activity
          const availCash = profile.available_to_work_dates_cash || []
          const availPay = profile.available_to_work_dates_payback || []
          const hasDayActivity = [
            ...availCash,
            ...availPay,
            ...(profile.need_coverage_cash_dates || []),
            ...(profile.need_coverage_payback_dates || [])
          ].some(d => d.trim() === activeDateFilter)
          matchesDate = hasDayActivity
        }
      }
    }

    return matchesSearch && matchesShift && matchesEquipment && matchesDate
  })

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p>Loading Crew Members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Rotational Crew</h1>
          <p>Manage and coordinate with all operators across every shift cycle.</p>
        </div>

        {activeMatchContext && (
          <div className={styles.matchBanner}>
            <div className={styles.matchBannerContent}>
              <span className={styles.matchBadge}>Smart Match Active</span>
              <p>Finding coverage for <strong>{new Date(activeMatchContext.date + 'T00:00:00').toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}</strong> ({activeMatchContext.equipment})</p>
            </div>
            <button className={styles.clearMatchBtn} onClick={clearMatchMode}>Exit Match Mode</button>
          </div>
        )}

        <div className={styles.controls}>
          {/* Row 1: Search and Shift */}
          <div className={styles.controlRow}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input 
                type="text" 
                placeholder="Search by name..." 
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Shift</span>
              <div className={styles.shifts}>
                {shifts.map(shift => (
                  <button 
                    key={shift}
                    className={`${styles.shiftBtn} ${activeShiftFilter === shift ? styles.active : ""}`}
                    onClick={() => setActiveShiftFilter(activeShiftFilter === shift ? null : shift)}
                  >
                    {shift}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Equipment and Activity */}
          <div className={styles.controlRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Equipment</span>
              <select 
                className={styles.selectFilter}
                value={activeEquipmentFilter || ""}
                onChange={(e) => setActiveEquipmentFilter(e.target.value || null)}
              >
                <option value="">All Equipment</option>
                {equipmentOptions.map(eq => (
                  <option key={eq} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Filter by date:</span>
              <div className={styles.dateSelectorArea}>
                <div className={styles.dateModeToggles}>
                  <button 
                    className={`${styles.modeToggleBtn} ${dateFilterType === 'none' ? styles.toggleActive : ''}`}
                    onClick={() => { setDateFilterType('none'); setActiveDateFilter(''); }}
                  >
                    None
                  </button>
                  <button 
                    className={`${styles.modeToggleBtn} ${dateFilterType === 'month' ? styles.toggleActive : ''}`}
                    onClick={() => { setDateFilterType('month'); setActiveDateFilter(''); }}
                  >
                    Month
                  </button>
                  <button 
                    className={`${styles.modeToggleBtn} ${dateFilterType === 'day' ? styles.toggleActive : ''}`}
                    onClick={() => { setDateFilterType('day'); setActiveDateFilter(''); }}
                  >
                    Day
                  </button>
                </div>

                {dateFilterType === 'month' && (
                  <div className={styles.monthYearSelectors}>
                    <select 
                      className={styles.dateSelect}
                      value={activeDateFilter.split('-')[1] || ""}
                      onChange={(e) => {
                        const month = e.target.value;
                        const year = activeDateFilter.split('-')[0] || new Date().getFullYear();
                        setActiveDateFilter(month ? `${year}-${month}` : "");
                      }}
                    >
                      <option value="">Month...</option>
                      {months.map((m, i) => {
                        const monthVal = String(i + 1).padStart(2, '0');
                        const isPast = activeDateFilter.split('-')[0] === String(new Date().getFullYear()) && 
                                       i < new Date().getMonth();
                        return (
                          <option key={m} value={monthVal} disabled={isPast}>
                            {m} {isPast ? "(Past)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <select 
                      className={styles.dateSelect}
                      value={activeDateFilter.split('-')[0] || ""}
                      onChange={(e) => {
                        const year = e.target.value;
                        const month = activeDateFilter.split('-')[1] || "";
                        setActiveDateFilter(month ? `${year}-${month}` : "");
                      }}
                    >
                      {Array.from({ length: 2 }, (_, i) => new Date().getFullYear() + i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}

                {dateFilterType === 'day' && (
                  <input 
                    type="date"
                    className={styles.dateInput}
                    value={activeDateFilter}
                    onChange={(e) => setActiveDateFilter(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.crewGrid}>
        {filteredProfiles && filteredProfiles.length > 0 ? (
          filteredProfiles.map(member => (
            <div 
              key={member.id} 
              className={styles.crewCard}
              onClick={() => setSelectedMember(member)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.shiftBadge}>Shift {member.shift}</div>
              <div className={styles.cardHeader}>
                <div className={`${styles.avatar} ${styles[`shift${member.shift}`]}`}>
                  {member.first_name ? member.first_name.charAt(0) : "?"}
                </div>
                <div className={styles.info}>
                  <h3>{member.first_name} {member.last_name}</h3>
                  <p>Certified Operator</p>
                </div>
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.detailRow}>
                  <span className={styles.icon}>🚜</span>
                  <span className={styles.label}>Primary</span>
                  <span className={styles.value}>{member.main_equipment}</span>
                </div>
                {member.secondary_equipment && member.secondary_equipment.length > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.icon}>🛠️</span>
                    <span className={styles.label}>Secondary</span>
                    <div className={styles.tagList}>
                      {Array.isArray(member.secondary_equipment) ? (
                        member.secondary_equipment.map(item => (
                          <span key={item} className={styles.miniChip}>{item}</span>
                        ))
                      ) : (
                        <span className={styles.miniChip}>{member.secondary_equipment}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <button 
                  className={styles.requestBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(member);
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No crew members found</h3>
            <p>Try adjusting your search or shift filters.</p>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className={styles.modalOverlay} onClick={() => setSelectedMember(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedMember(null)}>×</button>
            
            <div className={styles.modalHeader}>
              <div className={`${styles.avatarLarge} ${styles[`shift${selectedMember.shift}`]}`}>
                {selectedMember.first_name ? selectedMember.first_name.charAt(0) : "?"}
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.nameRow}>
                  <h2>{selectedMember.first_name} {selectedMember.last_name}</h2>
                  <span className={styles.modalShiftBadge}>Shift {selectedMember.shift}</span>
                </div>
                <div className={styles.modalSubHeader}>
                  <p>Heavy Equipment Operator</p>
                </div>
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* Messaging Interface */}
              <div className={styles.messageComposer}>
                <label className={styles.composerLabel}>
                  {activeMatchContext ? `Sending Request for ${activeMatchContext.date}` : "Send a message"}
                </label>
                <textarea 
                  className={styles.messageArea}
                  placeholder={activeMatchContext 
                    ? `Hi ${selectedMember.first_name}, are you available to cover my shift on ${activeMatchContext.date}?` 
                    : `Write a message to ${selectedMember.first_name}...`}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                <button 
                  className={styles.sendMessageBtn}
                  onClick={() => handleSendMessage(selectedMember.id)}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send Message"}
                </button>
              </div>

              <div className={styles.detailSection}>
                <h4>Equipment Certifications</h4>
                <div className={styles.equipmentList}>
                  <div className={styles.eqTag}>
                    <span className={styles.eqIcon}>🚜</span>
                    <span className={styles.eqValue}>{selectedMember.main_equipment}</span>
                    <span className={styles.primaryIndicator}>Primary</span>
                  </div>
                  {Array.isArray(selectedMember.secondary_equipment) && selectedMember.secondary_equipment.length > 0 && (
                    <div className={styles.eqTag}>
                      <span className={styles.eqIcon}>🛠️</span>
                      <span className={styles.eqValue}>
                        {selectedMember.secondary_equipment.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.calendarSection}>
                <div className={styles.calendarHeader}>
                  <div className={styles.navControls}>
                    <button onClick={() => setModalViewDate(new Date(modalViewDate.getFullYear(), modalViewDate.getMonth() - 1, 1))}>←</button>
                    <span>{months[modalViewDate.getMonth()]} {modalViewDate.getFullYear()}</span>
                    <button onClick={() => setModalViewDate(new Date(modalViewDate.getFullYear(), modalViewDate.getMonth() + 1, 1))}>→</button>
                  </div>
                </div>

                <div className={styles.miniGrid}>
                  {daysOfWeek.map(d => <div key={d} className={styles.dayOfWeekHeader}>{d}</div>)}
                  {Array.from({ length: new Date(modalViewDate.getFullYear(), modalViewDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDay}></div>
                  ))}
                  {Array.from({ length: new Date(modalViewDate.getFullYear(), modalViewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateObj = new Date(modalViewDate.getFullYear(), modalViewDate.getMonth(), dayNum);
                    const shiftType = getShiftForDate(dateObj, selectedMember.shift);
                    
                    let shiftClass = "";
                    if (shiftType === "Day Shift") shiftClass = styles.dayShift;
                    else if (shiftType === "Night Shift") shiftClass = styles.nightShift;
                    else if (shiftType === "Day Off") shiftClass = styles.offShift;

                    const dStr = dateObj.toISOString().split('T')[0];
                    const hasMutual = (selectedMember.available_to_work_dates_cash?.some(d => d.trim() === dStr)) || 
                                      (selectedMember.available_to_work_dates_payback?.some(d => d.trim() === dStr));
                    const hasCoverage = (selectedMember.need_coverage_cash_dates?.some(d => d.trim() === dStr)) || 
                                        (selectedMember.need_coverage_payback_dates?.some(d => d.trim() === dStr));

                    return (
                      <div 
                        key={dayNum} 
                        className={`${styles.dayCell} ${shiftClass} ${hasMutual ? styles.hasAvailable : ""} ${hasCoverage ? styles.hasCoverage : ""}`}
                      >
                        <span className={styles.dayNum}>{dayNum}</span>
                        <span className={styles.shiftIcon}>{getShiftIcon(shiftType)}</span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.legend}>
                  <div className={styles.legendItem}><span className={styles.dotMutual}></span> Available for Mutuals</div>
                  <div className={styles.legendItem}><span className={styles.dotCoverage}></span> Needs Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
