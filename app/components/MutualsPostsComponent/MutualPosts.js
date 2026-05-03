import styles from "./MutualPosts.module.css"
import AnimatedList from "./AnimatedList"
import { useData } from "../../context/DataContext"

export default function MutualPosts({list}) {
  const { currentUser, sendMessage, deletePost, updatePost } = useData();
  const getTitleClass = (title) => {
    if (title === 'Coverage Request') return styles.requestName;
    if (title === 'Offer Coverage') return styles.offerName;
    return styles.postName;
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId)
    }
  }

  const handleEditPost = async (post) => {
    const newContent = window.prompt("Edit your post content:", post.content);
    if (newContent && newContent !== post.content) {
      await updatePost(post.id, newContent)
    }
  }

  return (
    <div className={styles.container}>
      <AnimatedList
        items={list.map(post => (
          <div key={post.id} className={styles.postContent} onClick={(e) => {console.log(post)}}>
            <div className={styles.postHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p className={getTitleClass(post.title)}></p>
                {post.profiles?.main_equipment && (
                  <img 
                    src={`/${post.profiles.main_equipment.toLowerCase() === 'truck' ? 'dump-truck' : post.profiles.main_equipment.toLowerCase()}.png`} 
                    alt={post.profiles.main_equipment}
                    className={styles.equipIcon}
                  />
                )}
                { (post.content.toLowerCase().includes("cash") || post.content.toLowerCase().includes("$")) && (
                  <span title="Cash Payment" style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))' }}>💵</span>
                )}
              </div>
              <p className={styles.postShift}>
                {post.profiles ? `${post.profiles.first_name} ${post.profiles.last_name} (${post.profiles.shift || 'No Shift'})` : 'Unknown Author'}
              </p>
            </div>
            <div className={styles.postBody}>
              <div style={{ width: '100%' }}>
                <span className={styles.equipValue} style={{ display: 'block', marginBottom: '8px' }}>
                  {post.content}
                </span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.equipLabel} style={{ fontSize: '0.75rem' }}>
                    Posted: {new Date(post.created_at).toLocaleString()}
                  </span>
                  
                  {currentUser && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {post.author_id === currentUser.id ? (
                        <>
                          <button 
                            onClick={() => handleEditPost(post)}
                            className={styles.editBtn}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className={styles.deleteBtn}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
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
                          className={styles.msgBtn}
                        >
                          Send Message
                        </button>
                      )}
                    </div>
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