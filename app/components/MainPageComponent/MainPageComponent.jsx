

import styles from "./main.module.css"
import { useData } from "../../context/DataContext"

export default function MainPageComponent({ onNavigate }) {
  const { currentUser } = useData()

  const handleGetStarted = () => {
    if (currentUser) {
      onNavigate("crew")
    } else {
      onNavigate("profileCreation")
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.heroSection}>
        <div className={styles.heroBadge}>✨ Next-Gen Scheduling</div>
        <h1 className={styles.heroTitle}>Premium <span>ShiftFlow</span> Management</h1>
        <p className={styles.heroSubtitle}>
          Master your schedule with precision rotational tracking, automated shift cycles, and seamless team coordination across the mine.
        </p>
        <div className={styles.ctaGroup}>
          <button className={styles.primaryBtn} onClick={handleGetStarted}>Get Started</button>
        </div>
      </header>
      
      
    </div>
  )
}