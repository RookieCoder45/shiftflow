

import styles from "./main.module.css"
import { useData } from "../../context/DataContext"
import MutualPosts from "../MutualsPostsComponent/MutualPosts"



export default function MainPageComponent({ onNavigate }) {
  const { currentUser } = useData()


  return (
    <div className={styles.container}>
      <header className={styles.heroSection}>
       
        <h1 className={styles.heroTitle}>Premium <span>ShiftFlow</span> Management</h1>
        <div className={styles.ctaGroup}>
          <button className={styles.requestCoverageBtn} onClick={() => onNavigate("requestCoverage")}>Request coverage</button>
          <button className={styles.offerCoverageBtn} onClick={() => onNavigate("offerCoverage")}>Offer coverage</button>
        </div>
        
        <MutualPosts />


      </header>


    </div>
  )
}