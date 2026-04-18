"use client"

import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import styles from "./auth.module.css"

export default function AuthComponent() {
  const [mode, setMode] = useState("login") // "login" | "register"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage("Success! Please check your email for the confirmation link.")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logoCircle}>⚡</div>
          <h2>{mode === "login" ? "Welcome Back" : "Join ShiftFlow"}</h2>
          <p>{mode === "login" ? "Access your personalized shift rotation." : "Create your account to start tracking."}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="name@example.com"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          {error && <div className={styles.alertError}>{error}</div>}
          {message && <div className={styles.alertSuccess}>{message}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.loader}></span>
            ) : (
              mode === "login" ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {mode === "login" ? (
            <span>New to the mine? <button onClick={() => setMode("register")} className={styles.linkBtn}>Create an account</button></span>
          ) : (
            <span>Already a member? <button onClick={() => setMode("login")} className={styles.linkBtn}>Sign in instead</button></span>
          )}
        </div>
      </div>
    </div>
  )
}
