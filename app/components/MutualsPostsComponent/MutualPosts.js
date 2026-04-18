import styles from "./posts.module.css"
import { useData } from "../../context/DataContext"
import AnimatedList from './AnimatedList'

export default function MutualPosts() {
  const { data } = useData()

  if (!data) {
    return <div className={styles.container}>Loading...</div>;
  }

  const items = data.map((item) => {
    const hasCash = item.need_coverage_cash_dates && item.need_coverage_cash_dates.length > 0;
    const hasPayback = item.need_coverage_payback_dates && item.need_coverage_payback_dates.length > 0;
    const hasLegacy = item.need_coverage_dates && item.need_coverage_dates.length > 0;

    return (
      <div className={styles.postContent} key={item.id}>
        <div className={styles.postHeader}>
          <h3 className={styles.postName}>{item.first_name} {item.last_name}</h3>
          <span className={styles.postShift}>{item.shift} Shift</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><title xmlns="">mail-send-line</title><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 4a2 2 0 0 1 1.995 1.85L22 6v12a2 2 0 0 1-1.85 1.995L20 20H4a2 2 0 0 1-1.995-1.85L2 18v-1h2v1h16V7.414l-6.94 6.94a1.5 1.5 0 0 1-2.007.103l-.114-.103L4 7.414V8H2V6a2 2 0 0 1 1.85-1.995L4 4zM6 13a1 1 0 1 1 0 2H1a1 1 0 1 1 0-2zm12.586-7H5.414L12 12.586zM5 10a1 1 0 0 1 .117 1.993L5 12H2a1 1 0 0 1-.117-1.993L2 10z"/></g></svg>
        </div>
        <div className={styles.postBody}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span className={styles.equipLabel}>Equipment</span>
            <span className={styles.equipValue}>{item.main_equipment}</span>
          </div>
          
          {(hasCash || hasPayback || hasLegacy) && (
            <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)'}}>
              {hasCash && <span style={{background: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800'}}>Offering Cash 💸</span>}
              {hasPayback && <span style={{background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800'}}>Looking to Trade 🔄</span>}
              
            </div>
          )}
          
        </div>
      </div>
    );
  });

  return (
    <div className={styles.container}>
      <AnimatedList items={items} />
    </div>
  )
}