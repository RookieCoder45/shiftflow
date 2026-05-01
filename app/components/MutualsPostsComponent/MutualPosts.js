import styles from "./MutualPosts.module.css"
import AnimatedList from "./AnimatedList"
import { useData } from "../../context/DataContext"

export default function MutualPosts({list}) {
  const { currentUser, sendMessage } = useData();
  const getTitleClass = (title) => {
    if (title === 'Coverage Request') return styles.requestName;
    if (title === 'Offer Coverage') return styles.offerName;
    return styles.postName;
  }

  return (
    <div className={styles.container}>
      <AnimatedList
        items={list.map(post => (
          <div key={post.id} className={styles.postContent}>
            <div className={styles.postHeader}>
              <p className={getTitleClass(post.title)}>{post.title}</p>
              <p className={styles.postShift}>
                {post.profiles ? `${post.profiles.first_name} ${post.profiles.last_name} (${post.profiles.shift || 'No Shift'})` : 'Unknown Author'}
              </p>
            </div>
            <div className={styles.postBody}>
              <div style={{ width: '100%' }}>
                <span className={styles.equipValue} style={{ display: 'block', marginBottom: '8px' }}>
                  {post.content}
                </span>
                {post.profiles?.main_equipment && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Equipment: {post.profiles.main_equipment}
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.equipLabel} style={{ fontSize: '0.75rem' }}>
                    Posted: {new Date(post.created_at).toLocaleString()}
                  </span>
                  
                  {currentUser && (
                    <button 
                      onClick={async () => {
                        const msg = window.prompt(`Send a message to ${post.profiles?.first_name || 'the author'}:`);
                        if (msg) {
                          const res = await sendMessage(post.author_id, msg, "standard");
                          if (res.success) {
                            alert("Message sent successfully!");
                          } else {
                            alert("Failed to send message.");
                          }
                        }
                      }}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      Send Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      />
    </div>
  )
}