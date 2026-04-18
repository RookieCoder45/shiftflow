

import styles from './CoverageRequest.module.css'
import ReturnHomeComponent from './ReturnHomeComponent'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {useData} from '@/app/context/DataContext'
import CalendarManagement from './CalendarManagement'

export default function CoverageRequestComponent({onNavigate}) {
    const { user, loading: authLoading } = useAuth()
    const { currentUser, updateProfileDates } = useData()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [coverageRequest, setCoverageRequest] = useState({
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
    })

    useEffect(() => {
        if (!authLoading && !user) {
            onNavigate('profile')
        }
    }, [user, authLoading])

    if (authLoading || !user || !currentUser) return null



    const handleSubmit = async () => {
        setIsSubmitting(true)
        if (coverageRequest.need_coverage_dates && coverageRequest.need_coverage_dates.length > 0) {
            
            // Determine column based on Option 1 Strategy
            const isCash = coverageRequest.typeOfMutuals === 'Cash';
            const columnToUpdate = isCash ? "need_coverage_cash_dates" : "need_coverage_payback_dates";
            
            // Merge with existing dates to avoid overwriting previous requests
            const existingDates = currentUser[columnToUpdate] || [];
            const newDateSet = new Set([...existingDates, ...coverageRequest.need_coverage_dates]);
            const mergedDates = Array.from(newDateSet).sort();

            await updateProfileDates(currentUser.id, columnToUpdate, mergedDates)
        }
        setIsSubmitting(false)
        alert("Coverage Request Submitted! Dates saved to your profile.");
        onNavigate("home");
    }

    return (
        <div className={styles.container}>
            <h1>Coverage Request</h1>
            <div className={styles.sliderContainer}>    
                <div className={styles.slider}>
                    <div className={styles.sliderItem}>
                        {coverageRequest.sliderIndex === 0 && (
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
                                <button className={styles.nextBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 1})}>Next</button>
                            </div>
                           </div>
                        )}
                        {coverageRequest.sliderIndex === 1 && (
                            <div className={styles.card} style={{padding: '0 24px 24px 24px'}}>
                                <div className={styles.cardTop}>
                                    <CalendarManagement 
                                        startFresh={true}
                                        onDatesChange={(mode, dates) => {
                                            if(mode === 'coverage') {
                                                setCoverageRequest({...coverageRequest, need_coverage_dates: dates});
                                            }
                                        }}
                                    />
                                </div>
                               <div className={styles.btnContainer}>
                                <button className={styles.prevBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 0})}>Previous</button>
                                <button 
                                    className={styles.nextBtn} 
                                    style={(!coverageRequest.need_coverage_dates || coverageRequest.need_coverage_dates.length === 0) ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                    onClick={() => {
                                        if(!coverageRequest.need_coverage_dates || coverageRequest.need_coverage_dates.length === 0) {
                                            alert("Please select at least one date from the calendar to proceed.");
                                            return;
                                        }
                                        setCoverageRequest({...coverageRequest, sliderIndex: 2})
                                    }}
                                >Next</button>
                               </div>
                            </div>
                        )}
                       
                        {coverageRequest.sliderIndex === 2 && (
                            <div className={styles.card}>
                                <div className={styles.cardTop}>
                                    <h2>Coverage Type</h2>
                                    
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                                    <div className={styles.btnContainer} style={{marginTop: 0}}>
                                        <button className={styles.cashBtn} onClick={() => setCoverageRequest({...coverageRequest, typeOfMutuals: 'Cash', sliderIndex: 3})}>Cash</button>
                                        <p style={{margin: '0 8px', fontWeight: 'bold', color: 'var(--text-secondary)'}}>or</p>
                                        <button className={styles.payBackBtn} onClick={() => setCoverageRequest({...coverageRequest, typeOfMutuals: 'Pay Back', sliderIndex: 3})}>Pay Back</button>
                                    </div>
                                    <button className={styles.prevBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 1})}>Previous</button>
                                </div>
                            </div>
                        )}
                        {coverageRequest.sliderIndex === 3 && (
                            <div className={styles.card}>
                                <div className={styles.cardTop}>
                                    <h2>Confirm Request</h2>
                                    <p style={{color: 'var(--text-secondary)'}}>Review your coverage request before submitting.</p>
                                    <div style={{textAlign: 'left', margin: '16px 0', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)'}}>
                                        <p><strong>Shift:</strong> {coverageRequest.shift}</p>
                                        <p><strong>Equipment:</strong> {coverageRequest.main_equipment}</p>
                                        <p><strong>Dates:</strong> 
                                            <span style={{color: 'var(--accent)', marginLeft: '8px'}}>
                                            {coverageRequest.need_coverage_dates && coverageRequest.need_coverage_dates.length > 0
                                                ? coverageRequest.need_coverage_dates.length + " selected"
                                                : "None selected in calendar"}
                                            </span>
                                        </p>
                                        <p><strong>Payment:</strong> {coverageRequest.typeOfMutuals}</p>
                                    </div>
                                </div>
                                <div className={styles.btnContainer}>
                                    <button className={styles.prevBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 2})} disabled={isSubmitting}>Previous</button>
                                    <button 
                                        className={styles.submitBtn} 
                                        onClick={handleSubmit} 
                                        style={(!coverageRequest.need_coverage_dates || coverageRequest.need_coverage_dates.length === 0) ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                        disabled={isSubmitting || !coverageRequest.need_coverage_dates || coverageRequest.need_coverage_dates.length === 0}
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit"}
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