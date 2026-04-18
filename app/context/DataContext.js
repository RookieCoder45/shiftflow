// app/context/DataContext.js
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useAuth } from "./AuthContext"

const DataContext = createContext()

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data: result, error } = await supabase
        .from("profiles")
        .select("*")

      if (error) {
        console.error("Supabase error:", error)
        setLoading(false)
        return
      }

      setData(result)
      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (data && user) {
      const match = data.find(p => p.id === user.id)
      if (match) {
        setCurrentUser(match)
      }
    } else if (!user) {
      setCurrentUser(null)
    }
  }, [data, user])

  // Automated Startup Cleanup - Remove past dates from DB
  useEffect(() => {
    async function cleanupPastDates() {
      if (!currentUser) return

      const today = new Date().toISOString().split('T')[0]
      const hasPastAvailable = currentUser.available_to_work_dates?.some(d => d.trim() < today)
      const hasPastCoverage = currentUser.need_coverage_dates?.some(d => d.trim() < today)
      const hasPastCash = currentUser.need_coverage_cash_dates?.some(d => d.trim() < today)
      const hasPastPayback = currentUser.need_coverage_payback_dates?.some(d => d.trim() < today)

      if (hasPastAvailable || hasPastCoverage || hasPastCash || hasPastPayback) {
        const cleanAvailable = (currentUser.available_to_work_dates || []).filter(d => d.trim() >= today)
        const cleanCoverage = (currentUser.need_coverage_dates || []).filter(d => d.trim() >= today)
        const cleanCash = (currentUser.need_coverage_cash_dates || []).filter(d => d.trim() >= today)
        const cleanPayback = (currentUser.need_coverage_payback_dates || []).filter(d => d.trim() >= today)

        console.log("Found past dates. Sanitizing profile...")
        
        const { data: updated, error } = await supabase
          .from("profiles")
          .update({ 
            available_to_work_dates: cleanAvailable,
            need_coverage_dates: cleanCoverage,
            need_coverage_cash_dates: cleanCash,
            need_coverage_payback_dates: cleanPayback
          })
          .eq("id", currentUser.id)
          .select()

        if (!error && updated && updated.length > 0) {
          // Sync local state
          setData(prev => prev.map(p => p.id === currentUser.id ? updated[0] : p))
          setCurrentUser(updated[0])
        }
      }
    }

    cleanupPastDates()
  }, [currentUser?.id]) // Run when user ID is established/changed

  const updateShift = async (userId, newShift) => {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({ shift: newShift })
      .eq("id", userId)
      .select()

    if (error) {
      console.error("Error updating shift:", error)
      return { success: false, error }
    }

    if (updated && updated.length > 0) {
      setData(prev => prev.map(p => p.id === userId ? updated[0] : p))
      setCurrentUser(updated[0])
      return { success: true }
    }
    return { success: false }
  }

  const createProfile = async (profileData) => {
    if (!user) return { success: false, error: "No authenticated user" }

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert([
        { 
          id: user.id,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          shift: profileData.shift,
          main_equipment: profileData.mainEquipment,
          secondary_equipment: profileData.secondaryEquipment
        }
      ])
      .select()

    if (error) {
      console.error("Error creating profile:", error)
      return { success: false, error }
    }

    if (newProfile && newProfile.length > 0) {
      setData(prev => [...(prev || []), newProfile[0]])
      setCurrentUser(newProfile[0])
      return { success: true }
    }
    return { success: false }
  }

  const updateProfileDates = async (userId, column, dates) => {
    const { data: updated, error } = await supabase
      .from("profiles")
      .update({ [column]: dates })
      .eq("id", userId)
      .select()

    if (error) {
      console.error(`Error updating ${column}:`, error)
      return { success: false, error }
    }

    if (updated && updated.length > 0) {
      setData(prev => prev.map(p => p.id === userId ? updated[0] : p))
      setCurrentUser(updated[0])
      return { success: true }
    }
    return { success: false }
  }

  const [activeMatchContext, setActiveMatchContext] = useState(null) // { date: 'YYYY-MM-DD', equipment: '...' }
  const [inbox, setInbox] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch Inbox on Load/Update (Bi-directional)
  useEffect(() => {
    async function fetchInbox() {
      if (!currentUser) return

      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .or(`receiver_id.eq.${currentUser.id},sender_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })

      if (!error && messages) {
        setInbox(messages)
        setUnreadCount(messages.filter(m => !m.read && m.receiver_id === currentUser.id).length)
      }
    }

    fetchInbox()
  }, [currentUser])

  const sendMessage = async (receiverId, content, category = "standard", relatedDate = null) => {
    if (!currentUser) {
      console.error("Message Blocked: currentUser is null")
      return { success: false, error: "Not logged in" }
    }

    const payload = { 
      sender_id: currentUser.id,
      sender_name: `${currentUser.first_name} ${currentUser.last_name}`,
      receiver_id: receiverId,
      content,
      category,
      related_date: relatedDate || null,
      read: false
    }

    const { data: newMessage, error } = await supabase
      .from("messages")
      .insert([payload])
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return { success: false, error }
    }

    setInbox(prev => [newMessage[0], ...prev])
    return { success: true, data: newMessage[0] }
  }

  const acceptCoverageRequest = async (messageId, senderId, date) => {
    if (!currentUser) return { success: false }

    try {
      // 1. Update Sender (The one who requested coverage)
      // We fetch their current profile to modify their dates
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("need_coverage_dates, need_coverage_cash_dates, need_coverage_payback_dates")
        .eq("id", senderId)
        .single()

      if (senderProfile) {
        const updatedSenderDates = (senderProfile.need_coverage_dates || []).filter(d => d.trim() !== date.trim())
        const updatedCashDates = (senderProfile.need_coverage_cash_dates || []).filter(d => d.trim() !== date.trim())
        const updatedPaybackDates = (senderProfile.need_coverage_payback_dates || []).filter(d => d.trim() !== date.trim())
        await supabase
          .from("profiles")
          .update({ 
              need_coverage_dates: updatedSenderDates,
              need_coverage_cash_dates: updatedCashDates,
              need_coverage_payback_dates: updatedPaybackDates
          })
          .eq("id", senderId)
      }

      // 2. Update Receiver (The current user who accepted)
      const updatedMyDates = [...(currentUser.available_to_work_dates || []), date]
      await updateProfileDates(currentUser.id, "available_to_work_dates", updatedMyDates)

      // 3. Send automatic confirmation message
      await sendMessage(senderId, `I'VE ACCEPTED YOUR REQUEST! I'll cover your shift on ${date}.`, "standard")

      // 4. Mark the original request as read
      await markAsRead(messageId)

      return { success: true }
    } catch (err) {
      console.error("Error accepting request:", err)
      return { success: false }
    }
  }

  const acceptCoverageOffer = async (messageId, senderId, date) => {
    if (!currentUser) return { success: false }

    try {
      // 1. Update Receiver (The current user who originally needed coverage, now accepting the offer)
      const updatedCoverage = (currentUser.need_coverage_dates || []).filter(d => d.trim() !== date.trim())
      const updatedCash = (currentUser.need_coverage_cash_dates || []).filter(d => d.trim() !== date.trim())
      const updatedPayback = (currentUser.need_coverage_payback_dates || []).filter(d => d.trim() !== date.trim())
      
      await updateProfileDates(currentUser.id, "need_coverage_dates", updatedCoverage)
      await updateProfileDates(currentUser.id, "need_coverage_cash_dates", updatedCash)
      await updateProfileDates(currentUser.id, "need_coverage_payback_dates", updatedPayback)

      // 2. Update Sender (The one who offered to cover)
      const { data: senderProfile } = await supabase
        .from("profiles")
        .select("available_to_work_dates")
        .eq("id", senderId)
        .single()

      if (senderProfile) {
        const updatedSenderDates = [...(senderProfile.available_to_work_dates || []), date]
        await supabase
          .from("profiles")
          .update({ available_to_work_dates: Array.from(new Set(updatedSenderDates)) })
          .eq("id", senderId)
      }

      // 3. Send automatic confirmation message
      await sendMessage(senderId, `I'VE ACCEPTED YOUR OFFER! Thank you for covering my shift on ${date}.`, "standard")

      // 4. Mark the original offer as read
      await markAsRead(messageId)

      return { success: true }
    } catch (err) {
      console.error("Error accepting offer:", err)
      return { success: false }
    }
  }

  const markAsRead = async (messageId) => {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId)

    if (!error) {
      setInbox(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  return (
    <DataContext.Provider value={{ 
      data, setData, 
      currentUser, setCurrentUser, 
      updateShift, createProfile, updateProfileDates, 
      activeMatchContext, setActiveMatchContext,
      inbox, sendMessage, markAsRead, unreadCount,
      acceptCoverageRequest, acceptCoverageOffer,
      loading 
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}