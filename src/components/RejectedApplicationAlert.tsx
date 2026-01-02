import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';
import styles from './RejectedApplicationAlert.module.css';

interface RejectedApplicationAlertProps {
    rejectionReason: string;
    onResubmit: () => void;
}

export default function RejectedApplicationAlert({
    rejectionReason,
    onResubmit
}: RejectedApplicationAlertProps) {
    return (
        <div className={styles.alertBanner}>
            <div className={styles.alertIcon}>
                <AlertCircle size={24} />
            </div>
            <div className={styles.alertContent}>
                <h3 className={styles.alertTitle}>
                    ⚠️ Action Required: Your Application Was Returned
                </h3>
                <p className={styles.alertReason}>
                    <strong>Reason:</strong> {rejectionReason}
                </p>
                <p className={styles.alertInstruction}>
                    Please review the feedback above, update your application details, and resubmit for review.
                </p>
            </div>
            <button
                className={styles.resubmitButton}
                onClick={onResubmit}
            >
                Fix & Resubmit
            </button>
        </div>
    );
}
