import { useState } from "react"
import styles from "./main.module.css"
import { useData } from "../../context/DataContext"
import MutualPosts from "../MutualsPostsComponent/MutualPosts"
import { canCoverShift, parsePostContent, getShiftForDate } from "../../lib/shiftUtils"

export default function MainPageComponent({onNavigate}) {
  const { posts, currentUser } = useData();

  const [filterName, setFilterName] = useState("");
  const [filterShift, setFilterShift] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterTargetShift, setFilterTargetShift] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [smartFilterEnabled, setSmartFilterEnabled] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = (posts || []).filter(post => {
    // 1. Manual Filters
    const authorName = `${post.profiles?.first_name || ""} ${post.profiles?.last_name || ""}`.toLowerCase();
    if (filterName && !authorName.includes(filterName.toLowerCase())) return false;

    if (filterShift !== "All" && post.profiles?.shift !== filterShift) return false;

    if (filterType !== "All") {
      const title = post.title.toLowerCase();
      if (filterType === "Requests" && !title.includes("request")) return false;
      if (filterType === "Offers" && !title.includes("offer")) return false;
    }

    if (filterPayment !== "All") {
      const isCash = post.content.toLowerCase().includes("cash") || post.content.toLowerCase().includes("$");
      const isPayback = post.content.toLowerCase().includes("pay back");
      if (filterPayment === "Cash" && !isCash) return false;
      if (filterPayment === "Pay Back" && !isPayback) return false;
    }

    const equipment = `${post.profiles?.main_equipment || ""} ${post.profiles?.secondary_equipment || ""}`.toLowerCase();
    if (filterEquipment && !equipment.includes(filterEquipment.toLowerCase())) return false;

    // Parse dates and targets
    const { dates, shiftType, targetShiftLetter } = parsePostContent(post.title, post.content);
    
    // Normalize target shift from either direct field or content string
    const actualTarget = targetShiftLetter || (shiftType && shiftType.toLowerCase().includes("shift") ? shiftType.split(" ")[0].toUpperCase() : "");

    if (filterTargetShift !== "All" && actualTarget !== filterTargetShift) return false;

    if (filterDate && filterDate !== "All") {
      // Check if any date in the post includes the filterDate string
      const matchesDate = dates.some(d => d.includes(filterDate));
      if (!matchesDate) return false;
    }

    // 2. Smart Filter
    if (smartFilterEnabled) {
      if (!currentUser || !currentUser.shift) return true;

      const myShiftLetter = currentUser.shift;
      const postShiftLetter = post.profiles?.shift;

      if (!postShiftLetter) return true;

      if (myShiftLetter.toUpperCase() === postShiftLetter.toUpperCase()) {
        return false;
      }

      if (dates.length === 0 || (!shiftType && !targetShiftLetter)) return true;

      if (post.title === "Coverage Request") {
        if (targetShiftLetter && myShiftLetter.toUpperCase() !== targetShiftLetter.toUpperCase()) {
          return false;
        }
        
        return dates.every(dateStr => {
          const parts = dateStr.split("-");
          const targetDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const requiredShiftType = getShiftForDate(targetDateObj, postShiftLetter);
          if (requiredShiftType === "Day Off") return false;
          return canCoverShift(myShiftLetter, postShiftLetter, dateStr, requiredShiftType);
        });
      } 
      
      if (post.title === "Offer Coverage") {
        if (targetShiftLetter && myShiftLetter.toUpperCase() !== targetShiftLetter.toUpperCase()) {
          return false;
        }

        return dates.every(dateStr => {
          const parts = dateStr.split("-");
          const targetDateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const myScheduledShift = getShiftForDate(targetDateObj, myShiftLetter);
          if (myScheduledShift === "Day Off") return false;

          if (shiftType) {
            const shiftMatches = shiftType.toLowerCase().includes(myScheduledShift.toLowerCase().replace(" shift", ""));
            if (!shiftMatches) return false;
          }
          
          return canCoverShift(postShiftLetter, myShiftLetter, dateStr, myScheduledShift);
        });
      }
    }

    return true;
  });

  return (
    <div className={styles.container}>
      <header className={styles.heroSection}>
        <div className={styles.ctaGroup}>
          <button className={styles.requestCoverageBtn} onClick={() => onNavigate("requestCoverage")}>Request coverage</button>
          <button className={styles.offerCoverageBtn} onClick={() => onNavigate("offerCoverage")}>Offer coverage</button>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px',
          borderRadius: '16px',
          marginBottom: '15px',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem'
              }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          
          {showFilters && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Name..." 
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  <option value="All">All Posts</option>
                  <option value="Requests">Requests Only</option>
                  <option value="Offers">Offers Only</option>
                </select>
                <select 
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                >
                  <option value="All">Author Shift: All</option>
                  <option value="I">Author: I</option>
                  <option value="J">Author: J</option>
                  <option value="K">Author: K</option>
                  <option value="L">Author: L</option>
                </select>
                <select 
                  value={filterTargetShift}
                  onChange={(e) => setFilterTargetShift(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold', borderLeft: '4px solid #10b981' }}
                >
                  <option value="All">Target Shift: All</option>
                  <option value="I">Targeting: I</option>
                  <option value="J">Targeting: J</option>
                  <option value="K">Targeting: K</option>
                  <option value="L">Targeting: L</option>
                </select>
                <select 
                  value={filterEquipment}
                  onChange={(e) => setFilterEquipment(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                >
                  <option value="">All Equipment</option>
                  <option value="Truck">Truck</option>
                  <option value="Grader">Grader</option>
                  <option value="Bulldozer">Bulldozer</option>
                  <option value="Tiger">Tiger</option>
                  <option value="Excavator">Excavator</option>
                  <option value="Shovel">Shovel</option>
                </select>
                <select 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                >
                  <option value="All">All Months</option>
                  <option value="-01-">January</option>
                  <option value="-02-">February</option>
                  <option value="-03-">March</option>
                  <option value="-04-">April</option>
                  <option value="-05-">May</option>
                  <option value="-06-">June</option>
                  <option value="-07-">July</option>
                  <option value="-08-">August</option>
                  <option value="-09-">September</option>
                  <option value="-10-">October</option>
                  <option value="-11-">November</option>
                  <option value="-12-">December</option>
                </select>
                <select 
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                >
                  <option value="All">All Payment Types</option>
                  <option value="Cash">Cash Only 💵</option>
                  <option value="Pay Back">Pay Back Only 🔄</option>
                </select>
              </div>

              <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--accent)' }}>
                  <input 
                    type="checkbox" 
                    checked={smartFilterEnabled} 
                    onChange={(e) => setSmartFilterEnabled(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <strong>Smart Feed (Show only shifts I can cover)</strong>
                </label>
              </div>
            </>
          )}
        </div>
        
        <MutualPosts list={filteredPosts} />
      </header>
    </div>
  )
}