import React from 'react';
import { X, Building2, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './AddressModal.module.css'; // Reusing address modal styles for consistency

interface BusinessSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BusinessSelectionModal: React.FC<BusinessSelectionModalProps> = ({ isOpen, onClose }) => {
    const { businesses, selectedBusiness, selectBusiness } = useAuthStore();

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Select Business</h2>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.listContent}>
                    {businesses.length > 0 ? (
                        <div className={styles.list}>
                            {businesses.map((biz) => (
                                <div
                                    key={biz.id}
                                    className={`${styles.item} ${selectedBusiness?.id === biz.id ? styles.selected : ''}`}
                                    onClick={() => {
                                        selectBusiness(biz);
                                        onClose();
                                    }}
                                >
                                    <div className={styles.iconWrapper}>
                                        <Building2 size={24} />
                                    </div>
                                    <div className={styles.details}>
                                        <div className={styles.label}>{biz.name}</div>
                                        <div className={styles.address}>{biz.address}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{biz.phone}</div>
                                    </div>
                                    {selectedBusiness?.id === biz.id && (
                                        <div className={styles.checkIcon}>
                                            <Check size={20} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Building2 size={48} className={styles.emptyIcon} />
                            <p>No businesses registered yet.</p>
                            <p className={styles.emptySubtext}>Please go to your Profile to register a business.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
