import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Column */}
                    <div className={styles.column}>
                        <Link href="/" className={styles.logo}>
                            Go<span className={styles.logoAccent}>2</span>Grocer
                        </Link>
                        <p className={styles.description}>
                            Fresh groceries delivered to your doorstep in Chittagong. Fast, fresh, and affordable.
                        </p>
                        <div className={styles.socials}>
                            <a href="#" className={styles.socialLink}><Facebook size={20} /></a>
                            <a href="#" className={styles.socialLink}><Instagram size={20} /></a>
                            <a href="#" className={styles.socialLink}><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Company</h4>
                        <ul className={styles.list}>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/delivery-info">Delivery Information</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Customer Service</h4>
                        <ul className={styles.list}>
                            <li><Link href="/contact">Contact Support</Link></li>
                            <li><Link href="/faq">FAQ</Link></li>
                            <li><Link href="/returns">Returns & Refunds</Link></li>
                            <li><Link href="/loyalty">Go2Points Program</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Contact Us</h4>
                        <ul className={styles.contactList}>
                            <li>
                                <Phone size={18} className={styles.icon} />
                                <span>+880 1234 567890</span>
                            </li>
                            <li>
                                <Mail size={18} className={styles.icon} />
                                <span>support@go2grocer.com</span>
                            </li>
                            <li>
                                <MapPin size={18} className={styles.icon} />
                                <span>Nasirabad, Chittagong</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Go2Grocer. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
