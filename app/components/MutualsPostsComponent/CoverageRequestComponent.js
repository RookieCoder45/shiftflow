"use client"

import styles from './CoverageRequest.module.css'
import ReturnHomeComponent from './ReturnHomeComponent'
import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import {useData} from '@/app/context/DataContext'
import CalendarManagement from './CalendarManagement'


export default function CoverageRequestComponent({onNavigate}) {
    const { currentUser, updateProfileDates, createNewPost, updateMultipleProfileFields } = useData()
    const { user, loading: authLoading } = useAuth()
    
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

    // Populate state once currentUser loads
    useEffect(() => {
        if (currentUser) {
            setCoverageRequest(prev => ({
                ...prev,
                userLoggedIn: user,
                // Don't default shift, force them to select one
                user_id: currentUser.id,
                first_name: currentUser.first_name,
                last_name: currentUser.last_name,
                main_equipment: currentUser.main_equipment,
            }))
        }
    }, [currentUser, user])

    useEffect(() => {
        if (!authLoading && !user) {
            onNavigate('profile')
        }
    }, [user, authLoading])

    if (authLoading || !user || !currentUser) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Syncing Profile Data...</p>
            </div>
        );
    }



    const handleSubmit = async () => {
        setIsSubmitting(true)
        if (coverageRequest.need_coverage_dates && coverageRequest.need_coverage_dates.length > 0) {
            
            const isCash = coverageRequest.typeOfMutuals === 'Cash';
            const columnToUpdate = isCash ? "need_coverage_cash_dates" : "need_coverage_payback_dates";
            
            const existingDates = currentUser[columnToUpdate] || [];
            const newDateSet = new Set([...existingDates, ...coverageRequest.need_coverage_dates]);
            const mergedDates = Array.from(newDateSet).sort();

            const fieldsToUpdate = { [columnToUpdate]: mergedDates };

            // If Pay Back, also update available_to_work_dates_payback
            if (!isCash && coverageRequest.available_to_work_dates.length > 0) {
                const existingAvailable = currentUser.available_to_work_dates_payback || [];
                const newAvailableSet = new Set([...existingAvailable, ...coverageRequest.available_to_work_dates]);
                const mergedAvailable = Array.from(newAvailableSet).sort();
                fieldsToUpdate.available_to_work_dates_payback = mergedAvailable;
            }

            await updateMultipleProfileFields(currentUser.id, fieldsToUpdate);

            // Create a new post for this coverage request
            const title = "Coverage Request"
            let content = `Need coverage on ${coverageRequest.need_coverage_dates.join(", ")} from ${coverageRequest.shift} shift. Payment: ${coverageRequest.typeOfMutuals}`
            
            if (!isCash && coverageRequest.available_to_work_dates.length > 0) {
                content += `. Available to payback on: ${coverageRequest.available_to_work_dates.join(", ")}`
            }

            await createNewPost(title, content)
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
                                    <div style={{marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                        <label><strong>Request Coverage From:</strong></label>
                                        <div style={{display: 'flex', gap: '10px'}}>
                                            {['I', 'J', 'K', 'L']
                                                .filter(s => s !== currentUser.shift)
                                                .map(s => (
                                                <button 
                                                    key={s}
                                                    onClick={() => setCoverageRequest({...coverageRequest, shift: s})}
                                                    style={{
                                                        padding: '10px 20px', 
                                                        borderRadius: '8px', 
                                                        border: coverageRequest.shift === s ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                                                        background: coverageRequest.shift === s ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-primary)',
                                                        color: 'var(--text-primary)',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {s} Shift
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <p><strong>Main Equipment:</strong> {currentUser.main_equipment}</p>
                                </div>
                            </div>
                            <div className={styles.btnContainer}>
                                <button 
                                    className={styles.nextBtn} 
                                    onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 1})}
                                    disabled={!coverageRequest.shift}
                                    style={!coverageRequest.shift ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                                >
                                    Next
                                </button>
                            </div>
                           </div>
                        )}
                        {coverageRequest.sliderIndex === 1 && (
                            <div className={styles.card} style={{padding: '0 24px 24px 24px'}}>
                                <div className={styles.cardTop}>
                                    
                                    <CalendarManagement 
                                        startFresh={true}
                                        initialSelectionMode="coverage"
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
                                        <button className={styles.payBackBtn} onClick={() => setCoverageRequest({...coverageRequest, typeOfMutuals: 'Pay Back', sliderIndex: 4})}>Pay Back</button>
                                    </div>
                                    <button className={styles.prevBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 1})}>Previous</button>
                                </div>
                            </div>
                        )}

                        {coverageRequest.sliderIndex === 4 && (
                            <div className={styles.card} style={{padding: '0 24px 24px 24px', height:"max-content"}}>
                                <h2>Dates I Can Work (Payback)</h2>
                                <div className={styles.cardTop}>
                                    
                                    
                                    <CalendarManagement 
                                        startFresh={true}
                                        initialSelectionMode="available"
                                        onDatesChange={(mode, dates) => {
                                            if(mode === 'available') {
                                                setCoverageRequest({...coverageRequest, available_to_work_dates: dates});
                                            }
                                        }}
                                    />
                                </div>
                               <div className={styles.btnContainer}>
                                <button className={styles.prevBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 2})}>Previous</button>
                                <button 
                                    className={styles.nextBtn} 
                                    onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: 3})}
                                >Next</button>
                               </div>
                            </div>
                        )}

                        {coverageRequest.sliderIndex === 3 && (
                            <div className={styles.card}>
                                <div className={styles.cardTop}>
                                    <h2>Confirm Request</h2>
                                    <p style={{color: 'var(--text-secondary)'}}>Review your coverage request before submitting.</p>
                                    <div style={{textAlign: 'left', margin: '16px 0', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', background: 'var(--bg-secondary)'}}>
                                        <p><strong>Target Shift:</strong> {coverageRequest.shift} Shift</p>
                                        <p><strong>Equipment:</strong> {coverageRequest.main_equipment}</p>
                                        <p><strong>Need Coverage:</strong> 
                                            <span style={{color: 'var(--accent)', marginLeft: '8px'}}>
                                            {coverageRequest.need_coverage_dates && coverageRequest.need_coverage_dates.length > 0
                                                ? coverageRequest.need_coverage_dates.length + " selected"
                                                : "None"}
                                            </span>
                                        </p>
                                        <p><strong>Payment:</strong> {coverageRequest.typeOfMutuals}</p>
                                        {coverageRequest.typeOfMutuals === 'Pay Back' && coverageRequest.available_to_work_dates.length > 0 && (
                                            <p><strong>Available to Payback:</strong> 
                                                <span style={{color: 'var(--accent)', marginLeft: '8px'}}>
                                                {coverageRequest.available_to_work_dates.length} selected
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.btnContainer}>
                                    <button className={styles.prevBtn} onClick={() => setCoverageRequest({...coverageRequest, sliderIndex: coverageRequest.typeOfMutuals === 'Pay Back' ? 4 : 2})} disabled={isSubmitting}>Previous</button>
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