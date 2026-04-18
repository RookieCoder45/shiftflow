"use client"

import styles from "./page.module.css"
import { useState, useEffect } from "react"
import { useTheme } from "./context/ThemeContext"
import MainPageComponent from "./components/MainPageComponent/MainPageComponent"
import CalendarComponent from "./components/CalendarComponent/CalendarComponent"
import ProfileComponent from "./components/ProfileComponent/ProfileComponent"
import ProfileCreationComponent from "./components/ProfileCreationComponent/ProfileCreationComponent" 
import CrewComponent from "./components/CrewComponent/CrewComponent"
import { useAuth } from "./context/AuthContext"
import { useData } from "./context/DataContext"
import MessagesComponent from "./components/MessagesComponent/MessagesComponent"
import CoverageRequestComponent from "./components/MutualsPostsComponent/CoverageRequestComponent"
import OfferCoverageComponent from "./components/MutualsPostsComponent/OfferCoverageComponent"

export default function Home () {
  const [mobileContent, setMobileContent] = useState("home")
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth()
  const { unreadCount } = useData()

  useEffect(() => {
    const handleNavigation = (e) => {
      setMobileContent(e.detail);
    };

    window.addEventListener('navigate', handleNavigation);
    return () => window.removeEventListener('navigate', handleNavigation);
  }, []);

  function handleNavButtonClick(section) {
    setMobileContent(section)
  }

  return (
    <div className={styles.app}>
      <nav className={`${styles.navbar} glass animate-fade-in`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Shift<span>Flow</span></span>
        </div>

        {/* Desktop Navigation Links */}
        <div className={styles.navLinks}>
          <button className={mobileContent === "home" ? styles.active : ""} onClick={() => handleNavButtonClick("home")}>Home</button>
          <button className={mobileContent === "calendar" ? styles.active : ""} onClick={() => handleNavButtonClick("calendar")}>Calendar</button>
          
          <button className={mobileContent === "messages" ? styles.active : ""} onClick={() => handleNavButtonClick("messages")}>
            Messages {unreadCount > 0 && <span className={styles.navBadge}>{unreadCount}</span>}
          </button>
          <button className={mobileContent === "profile" ? styles.active : ""} onClick={() => handleNavButtonClick("profile")}>
            {user ? "Profile" : "Sign In"}
          </button>
        </div>
        
        <div className={styles.navActions}>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            <span className={styles.toggleIcon}>
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>
          {user && (
            <div className={styles.userBadge} onClick={() => handleNavButtonClick("profile")}>
              {user.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </nav>

      <main className={`${styles.mainContent} animate-fade-in`}>
        {mobileContent === "home" && (
          <MainPageComponent onNavigate={handleNavButtonClick} />
        )}
        {mobileContent === "calendar" && <CalendarComponent />} 
        {mobileContent === "crew" && <CrewComponent />}
        {mobileContent === "requestCoverage" && <CoverageRequestComponent onNavigate={handleNavButtonClick} />}
        {mobileContent === "offerCoverage" && <OfferCoverageComponent onNavigate={handleNavButtonClick} />}
        {mobileContent === "messages" && <MessagesComponent />}
        {mobileContent === "profile" && <ProfileComponent />}
        {mobileContent === "profileCreation" && <ProfileCreationComponent />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`${styles.mobileBottomNav} glass`}>
        <button 
          className={mobileContent === "home" ? styles.activeTab : ""} 
          onClick={() => handleNavButtonClick("home")}
        >
          <span className={styles.tabIcon}>🏠</span>
          <span className={styles.tabLabel}>Home</span>
        </button>
        <button 
          className={mobileContent === "calendar" ? styles.activeTab : ""} 
          onClick={() => handleNavButtonClick("calendar")}
        >
          <span className={styles.tabIcon}>📅</span>
          <span className={styles.tabLabel}>Calendar</span>
        </button>
        <button 
          className={mobileContent === "crew" ? styles.activeTab : ""} 
          onClick={() => handleNavButtonClick("crew")}
        >
          <span className={styles.tabIcon}>👥</span>
          <span className={styles.tabLabel}>Crew</span>
        </button>
        <button 
          className={mobileContent === "messages" ? styles.activeTab : ""} 
          onClick={() => handleNavButtonClick("messages")}
        >
          <div className={styles.iconWrapper}>
            <span className={styles.tabIcon}>💬</span>
            {unreadCount > 0 && <span className={styles.mobileBadge}>{unreadCount}</span>}
          </div>
          <span className={styles.tabLabel}>Inbox</span>
        </button>
        <button 
          className={mobileContent === "profile" ? styles.activeTab : ""} 
          onClick={() => handleNavButtonClick("profile")}
        >
          <span className={styles.tabIcon}>👤</span>
          <span className={styles.tabLabel}>{user ? "Profile" : "Sign In"}</span>
        </button>
      </div>
     
    </div>
  )
}