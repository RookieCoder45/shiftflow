
import styles from './ReturnHomeComponent.module.css'

export default function ReturnHomeComponent({onNavigate}) {
    return (
        
            <button className={styles.returnHomeBtn} onClick={() => onNavigate("home")}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><title xmlns="">back</title><path fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="4" d="M44 40.836q-7.34-8.96-13.036-10.168t-10.846-.365V41L4 23.545L20.118 7v10.167q9.523.075 16.192 6.833q6.668 6.758 7.69 16.836Z" clipRule="evenodd"/></svg>Home</button>
        
    )
}