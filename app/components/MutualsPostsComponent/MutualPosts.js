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
              {(!hasCash && !hasPayback && hasLegacy) && <span style={{background: 'var(--accent)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800'}}>Needs Coverage</span>}
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