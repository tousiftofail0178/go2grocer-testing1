import React from 'react';
import { X, MapPin, Phone, CreditCard, Package } from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { Button } from '@/components/ui/Button';
import styles from './OrderDetailsModal.module.css';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Order Details</h2>
                        <p className={styles.orderId}>#{order.id}</p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Status Bar */}
                    <div className={styles.statusBar}>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Order Date</span>
                            <span className={styles.statusValue}>{order.date}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Total Amount</span>
                            <span className={styles.statusValue}>৳{order.total}</span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel}>Status</span>
                            <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()]}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Items ({order.items.length})</h3>
                        <div className={styles.itemsList}>
                            {order.items.map((item) => (
                                <div key={item.id} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemMeta}>{item.weight}</span>
                                    </div>
                                    <div className={styles.itemRight}>
                                        <span className={styles.itemQty}>x{item.quantity}</span>
                                        <span className={styles.itemPrice}>৳{item.price * item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery & Payment */}
                    <div className={styles.row}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Delivery Details</h3>
                            <div className={styles.detailRow}>
                                <MapPin size={16} className={styles.icon} />
                                <div>
                                    <p className={styles.detailText}>{order.shippingAddress.address}</p>
                                    <p className={styles.subText}>{order.shippingAddress.area}</p>
                                </div>
                            </div>
                            <div className={styles.detailRow}>
                                <Phone size={16} className={styles.icon} />
                                <p className={styles.detailText}>{order.shippingAddress.phone}</p>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Payment Method</h3>
                            <div className={styles.detailRow}>
                                <CreditCard size={16} className={styles.icon} />
                                <p className={styles.detailText}>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital Payment'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={onClose} fullWidth>Close</Button>
                </div>
            </div>
        </div>
    );
};
