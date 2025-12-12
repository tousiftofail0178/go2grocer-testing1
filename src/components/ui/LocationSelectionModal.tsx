import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Button } from './Button';
import { DELIVERY_AREAS } from '@/lib/data';
import styles from './AddressModal.module.css'; // Reusing styles

interface LocationSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect?: (area: string) => void;
}

export const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelect
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div>
                        <h2>Select Delivery Location</h2>
                        <p style={{ color: 'var(--text-grey)', fontSize: '0.875rem', marginTop: '0.25rem' }}>We currently deliver to the following areas</p>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.listContent}>
                    <div className={styles.list}>
                        {DELIVERY_AREAS.map((area) => (
                            <div
                                key={area}
                                className={styles.item}
                                onClick={() => {
                                    if (onSelect) onSelect(area);
                                    onClose();
                                }}
                                style={{ cursor: onSelect ? 'pointer' : 'default' }}
                            >
                                <div className={styles.iconWrapper}>
                                    <MapPin size={20} />
                                </div>
                                <div className={styles.details}>
                                    <div className={styles.label}>{area}</div>
                                    <div className={styles.address}>Chittagong</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
