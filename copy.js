import { useState, useEffect } from 'react'
import styles from './CoverageRequest.module.css'
import ReturnHomeComponent from './ReturnHomeComponent'
import CalendarManagement from './CalendarManagement'
import { useData } from '@/app/context/DataContext'
import { useAuth } from '@/app/context/AuthContext'
import ProfileComponent from '../ProfileComponent/ProfileComponent'

export default function OfferCoverageComponent({onNavigate}) {
    const { data, currentUser, sendMessage, user, updateProfileDates } = useData()
    const { loading: authLoading } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    

    // ALL hooks MUST be above any conditional return
    const [offerCoverage, setOfferCoverage] = useState({
        userLoggedIn: null,
        sliderIndex: 0,
        shift: "",
        user_id: "",
        first_name: "",
        last_name: "",
        main_equipment: "",
        available_to_work_dates: [],
        need_coverage_dates: [],
        typeOfMutuals: "",
        cashAmount: "",
    })

    // Populate state once currentUser loads
    useEffect(() => {
        if (currentUser) {
            setOfferCoverage(prev => ({
                ...prev,
                userLoggedIn: user,
                shift: currentUser.shift,
                user_id: currentUser.id,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                main_equipment: currentUser.main_equipment,
            }))
        }
    }, [currentUser, user])

   

    const handleSubmit = async () => {
        setIsSubmitting(true)
        if (offerCoverage.available_to_work_dates && offerCoverage.available_to_work_dates.length > 0) {
            const isCash = offerCoverage.typeOfMutuals === 'Cash';
            const columnToUpdate = isCash ? "available_to_work_dates_cash" : "available_to_work_dates_payback";
            
            const existingDates = currentUser[columnToUpdate] || [];
            const newDateSet = new Set([...existingDates, ...offerCoverage.available_to_work_dates]);
            const mergedDates = Array.from(newDateSet).sort();

            await updateProfileDates(currentUser.id, columnToUpdate, mergedDates)
        }
        setIsSubmitting(false)
        alert("Coverage Offer Submitted! Dates saved to your profile.");
        onNavigate("home");
    }

    return (
        <div className={styles.container}>
            <h1>Offer Coverage</h1>
            <div className={styles.sliderContainer}>
                <div className={styles.slider}>
                    <div className={styles.sliderItem}>
                       {offerCoverage.sliderIndex === 0 && (
                           <div className={styles.card}>
                            <div className={styles.cardTop}>
                                <h2>{currentUser.first_name} {currentUser.last_name}</h2>
                                <p style={{color: 'var(--text-secondary)'}}>Your profile information</p>
                                <div style={{textAlign: 'left', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '20px'}}>
                                    <p style={{marginBottom: '10px'}}><strong>Shift:</strong> {currentUser.shift}</p>
                                    <p><strong>Main Equipment:</strong> {currentUser.main_equipment}</p>
                                </div>
                            </div>
                            <div className={styles.btnContainer}>
                                <button className={styles.nextBtn} onClick={() => setOfferCoverage({...offerCoverage, sliderIndex: 1})}>Next</button>
                            </div>
                           </div>
                        )}
                        {offerCoverage.sliderIndex === 1 && (
                            <div className={styles.card} style={{padding: '0 24px 24px 24px'}}>
                                <div className={styles.cardTop}>
                                    <CalendarManagement 
                                        startFresh={true}
                                        initialSelectionMode="available"
                                        onDatesChange={(mode, dates) => {
                                            if(mode === 'available') {
                                                setOfferCoverage({...offerCoverage, available_to_work_dates: dates});
                                            }
                                        }}
                                    />
                                </div>
                               <div className={styles.btnContainer}>
                                <button className={styles.prevBtn} onClick={() => setOfferCoverage({...offerCoverage, sliderIndex: 0})}>Previous</button>
                                <button 
                                    className={styles.nextBtn} 
                                    style={(!offerCoverage.available_to_work_dates || offerCoverage.available_to_work_dates.length === 0) ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                    onClick={() => {
                                        if(!offerCoverage.available_to_work_dates || offerCoverage.available_to_work_dates.length === 0) {
                                            alert("Please select at least one day off from the calendar to proceed.");
                                            return;
                                        }
                                        setOfferCoverage({...offerCoverage, sliderIndex: 2})
                                    }}
                                >Next</button>
                               </div>
                            </div>
                        )}
                        {offerCoverage.sliderIndex === 2 && (
                            <div className={styles.card}>
                                <div className={styles.cardTop}>
                                    <h2>Coverage Type</h2>
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    <div className={styles.btnContainer} style={{marginTop: 0}}>
                                        <button className={styles.cashBtn} onClick={() => setOfferCoverage({...offerCoverage, typeOfMutuals: 'Cash', sliderIndex: 3})}>Cash</button>
                                        <p style={{margin: '0 8px', fontWeight: 'bold', color: 'var(--text-secondary)'}}>or</p>
                                        <button className={styles.payBackBtn} onClick={() => setOfferCoverage({...offerCoverage, typeOfMutuals: 'Pay Back', sliderIndex: 4})}>Pay Back</button>
                                    </div>
                                    <button className={styles.prevBtn} onClick={() => setOfferCoverage({...offerCoverage, sliderIndex: 1})}>Previous</button>
                                </div>
                            </div>
                        )}
                        {offerCoverage.sliderIndex === 3 && (
                            <div className={styles.card}>
                                <div className={styles.cardTop}>
                                    <h2>Cash Amount</h2>
                                    <p style={{color: 'var(--text-secondary)'}}>Enter how much you are charging per shift, or skip.</p>
                                    <div style={{marginTop: '20px'}}>
                                        <input 
                                            type="text" 
                                            placeholder="$0" 
                                            value={offerCoverage.cashAmount} 
                                            onChange={(e) => setOfferCoverage({...offerCoverage, cashAmount: e.target.value})}
                                            style={{width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '1.5rem', textAlign: 'center', color: 'var(--text-primary)'}}
                                        />
                                    </div>
                                </div>
                                <div className={styles.btnContainer} style={{flexDirection: 'column', gap: '8px'}}>
                                    <button className={styles.nextBtn} style={{width: '100%', margin: 0}} onClick={() => setOfferCoverage({...offerCoverage, sliderIndex: 4})}>
                                        {offerCoverage.cashAmount ? "Continue" : "Skip"}
                                    </button>
                                    <button className={styles.prevBtn} style={{width: '100%', margin: 0}} onClick={() => setOfferCoverage({...offerCoverage, sliderIndex: 2})}>Previous</button>
                                </div>
                            </div>
                        )}
                        {offerCoverage.sliderIndex === 4 && (
                            <div className={styles.card}>
                                <div className={styles.cardTop}>
                                    <h2>Confirm Offer Broadcast</h2>
                                    <p style={{color: 'var(--text-secondary)'}}>Review your offering details before submitting.</p>
                                    <div style={{textAlign: 'left', margin: '16px 0', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)'}}>
                                        <p><strong>Shift:</strong> {offerCoverage.shift}</p>
                                        <p><strong>Equipment:</strong> {offerCoverage.main_equipment}</p>
                                        <p><strong>Dates:</strong> 
                                            <span style={{color: 'var(--accent)', marginLeft: '8px'}}>
                                            {offerCoverage.available_to_work_dates && offerCoverage.available_to_work_dates.length > 0
                                                ? offerCoverage.available_to_work_dates.length + " selected"
                                                : "None selected in calendar"}
                                            </span>
                                        </p>
                                        <p><strong>Payment:</strong> {offerCoverage.typeOfMutuals} {offerCoverage.typeOfMutuals === 'Cash' && offerCoverage.cashAmount ? `($${offerCoverage.cashAmount})` : ""}</p>
                                    </div>
                                </div>
                                <div className={styles.btnContainer}>
                                    <button className={styles.prevBtn} onClick={() => setOfferCoverage({...offerCoverage, sliderIndex: offerCoverage.typeOfMutuals === 'Cash' ? 3 : 2})} disabled={isSubmitting}>Previous</button>
                                    <button 
                                        className={styles.submitBtn} 
                                        onClick={handleSubmit} 
                                        style={(!offerCoverage.available_to_work_dates || offerCoverage.available_to_work_dates.length === 0) ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                        disabled={isSubmitting || !offerCoverage.available_to_work_dates || offerCoverage.available_to_work_dates.length === 0}
                                    >
                                        {isSubmitting ? "Broadcasting..." : "Broadcast Offer"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ReturnHomeComponent onNavigate={onNavigate} />
        </div>
    )
}