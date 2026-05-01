"use client"

import { useState } from "react"
import { useData } from "../../context/DataContext"
import styles from "./messages.module.css"

export default function MessagesComponent() {
  const { inbox, markAsRead, deleteMessage, deleteThread, currentUser, sendMessage, unreadCount, acceptCoverageRequest, acceptCoverageOffer } = useData()
  const [selectedThreadUser, setSelectedThreadUser] = useState(null) // { id, name }
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  // Group messages by conversation partner
  const threads = inbox.reduce((acc, msg) => {
    const isMe = msg.sender_id === currentUser.id
    const partnerId = isMe ? msg.receiver_id : msg.sender_id
    const partnerName = isMe ? msg.receiver_name : msg.sender_name
    
    if (!acc[partnerId]) {
      acc[partnerId] = {
        partnerId,
        partnerName: partnerName || "Operator",
        messages: [],
        unreadCount: 0
      }
    }
    
    // Always prefer a real name if we encounter one in the thread
    if (partnerName && partnerName !== "Operator") {
      acc[partnerId].partnerName = partnerName
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

  const handleAcceptOffer = async (msg) => {
    if (isProcessingAction) return
    setIsProcessingAction(true)
    
    const res = await acceptCoverageOffer(msg.id, msg.sender_id, msg.related_date)
    
    setIsProcessingAction(false)
    if (res.success) {
      alert("Offer Accepted! Calendars updated.")
    } else {
      alert("Error accepting offer. Please try again.")
    }
  }

  const handleDeleteMessage = async (e, messageId) => {
    e.stopPropagation()
    if (window.confirm("Delete this message?")) {
      await deleteMessage(messageId)
    }
  }

  const handleDeleteThread = async (e, partnerId) => {
    e.stopPropagation()
    if (window.confirm("Delete the entire conversation? This will remove all messages for both users.")) {
      const res = await deleteThread(partnerId)
      if (res.success && selectedThreadUser?.partnerId === partnerId) {
        setSelectedThreadUser(null)
      }
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={styles.msgTime}>
                          {new Date(thread.messages[0].created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <button 
                          className={styles.deleteThreadBtn}
                          onClick={(e) => handleDeleteThread(e, thread.partnerId)}
                          title="Delete Conversation"
                        >
                          🗑️
                        </button>
                      </div>
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
                      {msg.category === 'coverage_offer' && (
                        <div className={styles.bubbleRequestHeader} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderBottom: '1px solid rgba(16, 185, 129, 0.2)'}}>
                          <span className={styles.reqIcon}>🤝</span>
                          <span>Offered to cover your shift on <strong>{msg.related_date}</strong></span>
                        </div>
                      )}
                      <p>{msg.content}</p>
                      <div className={styles.bubbleFooter}>
                        <span className={styles.bubbleTime}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button 
                          className={styles.deleteBubbleBtn} 
                          onClick={(e) => handleDeleteMessage(e, msg.id)}
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {msg.category === 'coverage_request' && msg.sender_id !== currentUser.id && !msg.read && (
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
                      {msg.category === 'coverage_offer' && msg.sender_id !== currentUser.id && !msg.read && (
                        <div className={styles.bubbleActions}>
                          <button 
                            className={styles.bubbleAcceptBtn}
                            style={{background: '#10b981'}}
                            onClick={() => handleAcceptOffer(msg)}
                            disabled={isProcessingAction}
                          >
                            {isProcessingAction ? "..." : "Accept Offer"}
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
