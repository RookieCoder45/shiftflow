"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import styles from "./messages.module.css"

export default function MessagesComponent() {
  const { inbox, markAsRead, currentUser, sendMessage, unreadCount, acceptCoverageRequest } = useData()
  const [selectedThreadUser, setSelectedThreadUser] = useState(null) // { id, name }
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  // Group messages by conversation partner
  const threads = inbox.reduce((acc, msg) => {
    const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
    const partnerName = msg.sender_id === currentUser.id ? "Me" : msg.sender_name // We need a way to get the actual receiver name if it was us sending, but for now we have sender_name
    
    // Fallback: If we sent it, we need to find who we sent it to in the profile data ideally, 
    // but we'll use a placeholder or the first message's sender name if available.
    // Enhanced hack: Use the name from the message where the partner was the sender.
    if (!acc[partnerId]) {
      acc[partnerId] = {
        partnerId,
        partnerName: msg.sender_id === currentUser.id ? "Operator" : msg.sender_name,
        messages: [],
        unreadCount: 0
      }
    }
    
    if (msg.sender_id !== currentUser.id && msg.sender_name !== "Operator") {
      acc[partnerId].partnerName = msg.sender_name
    }

    acc[partnerId].messages.push(msg)
    if (!msg.read && msg.receiver_id === currentUser.id) {
      acc[partnerId].unreadCount++
    }
    return acc
  }, {})

  const sortedThreads = Object.values(threads).sort((a,b) => 
    new Date(b.messages[0].created_at) - new Date(a.messages[0].created_at)
  )

  const activeMessages = selectedThreadUser 
    ? [...(threads[selectedThreadUser.partnerId]?.messages || [])].reverse() 
    : []

  const handlePartnerSelect = (partner) => {
    setSelectedThreadUser(partner)
    // Mark all as read in this thread
    const unreadInThread = threads[partner.partnerId]?.messages.filter(m => !m.read && m.receiver_id === currentUser.id) || []
    unreadInThread.forEach(m => markAsRead(m.id))
  }

  const handleBackToList = () => {
    setSelectedThreadUser(null)
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedThreadUser) return
    setIsSending(true)

    const res = await sendMessage(
      selectedThreadUser.partnerId,
      replyContent,
      "standard"
    )

    setIsSending(false)
    if (res.success) {
      setReplyContent("")
    } else {
      alert("Failed to send reply")
    }
  }

  const handleAccept = async (msg) => {
    if (isProcessingAction) return
    setIsProcessingAction(true)
    
    const res = await acceptCoverageRequest(msg.id, msg.sender_id, msg.related_date)
    
    setIsProcessingAction(false)
    if (res.success) {
      alert("Fulfillment Successful! Calendars updated.")
    } else {
      alert("Fulfillment Error. Please try again.")
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Communications</h1>
        <p>Real-time coordination threads with your crew.</p>
      </header>

      <div className={`${styles.dashboard} ${selectedThreadUser ? styles.showingChat : ""}`}>
        {/* Sidebar: Threads */}
        <div className={styles.inboxList}>
          <div className={styles.listHeader}>
            <h3>Conversations</h3>
            <span className={styles.msgCount}>{sortedThreads.length} threads</span>
          </div>
          
          <div className={styles.scrollArea}>
            {sortedThreads.length === 0 ? (
              <div className={styles.emptyInbox}>
                <span className={styles.emptyIcon}>📭</span>
                <p>No conversations yet</p>
              </div>
            ) : (
              sortedThreads.map(thread => (
                <div 
                  key={thread.partnerId} 
                  className={`${styles.threadItem} ${thread.unreadCount > 0 ? styles.unread : ""} ${selectedThreadUser?.partnerId === thread.partnerId ? styles.selected : ""}`}
                  onClick={() => handlePartnerSelect(thread)}
                >
                  <div className={styles.threadAvatar}>
                    {thread.partnerName.charAt(0)}
                  </div>
                  <div className={styles.threadMeta}>
                    <div className={styles.msgPreviewHeader}>
                      <span className={styles.senderName}>{thread.partnerName}</span>
                      <span className={styles.msgTime}>
                        {new Date(thread.messages[0].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={styles.contentPreview}>
                      {thread.messages[0].sender_id === currentUser.id ? "You: " : ""}{thread.messages[0].content}
                    </p>
                    {thread.unreadCount > 0 && <span className={styles.threadBadge}>{thread.unreadCount}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Reader */}
        <div className={styles.readerView}>
          {selectedThreadUser ? (
            <div className={styles.chatContainer}>
              <div className={styles.chatHeader}>
                <button className={styles.mobileBackBtn} onClick={handleBackToList}>
                  ←
                </button>
                <div className={styles.senderAvatarSmall}>
                  {selectedThreadUser.partnerName.charAt(0)}
                </div>
                <h2>{selectedThreadUser.partnerName}</h2>
              </div>

              <div className={styles.chatHistory}>
                {activeMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`${styles.bubbleWrapper} ${msg.sender_id === currentUser.id ? styles.myBubble : styles.theirBubble}`}
                  >
                    <div className={styles.bubble}>
                      {msg.category === 'coverage_request' && (
                        <div className={styles.bubbleRequestHeader}>
                          <span className={styles.reqIcon}>📅</span>
                          <span>Coverage requested for <strong>{msg.related_date}</strong></span>
                        </div>
                      )}
                      <p>{msg.content}</p>
                      <span className={styles.bubbleTime}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {msg.category === 'coverage_request' && msg.sender_id !== currentUser.id && (
                        <div className={styles.bubbleActions}>
                          <button 
                            className={styles.bubbleAcceptBtn}
                            onClick={() => handleAccept(msg)}
                            disabled={isProcessingAction}
                          >
                            {isProcessingAction ? "..." : "Accept Request"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.chatInputArea}>
                <textarea 
                  className={styles.chatInput}
                  placeholder="Type a response..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button 
                  className={styles.chatSendBtn}
                  onClick={handleSendReply}
                  disabled={isSending || !replyContent.trim()}
                >
                  🚀
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.readerEmpty}>
              <div className={styles.readerEmptyIcon}>💬</div>
              <p>Select a conversation to start coordinating</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
