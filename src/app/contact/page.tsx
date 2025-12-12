"use client";

import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../static-pages.module.css';

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 500);
    };

    const handleClose = () => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Contact Support</h1>
            <p className={styles.subtitle}>
                Have a question or need help with an order? We are here for you.
            </p>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Get in Touch</h2>
                    <div className={styles.list} style={{ listStyle: 'none', padding: 0 }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <Phone className={styles.highlight} size={24} />
                            <span>+880 1234 567890</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <Mail className={styles.highlight} size={24} />
                            <span>support@go2grocer.com</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <MapPin className={styles.highlight} size={24} />
                            <span>Nasirabad, Chittagong</span>
                        </div>
                    </div>
                    <Button fullWidth icon={<MessageCircle size={20} />}>Chat on WhatsApp</Button>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Send us a Message</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Input
                            name="name"
                            label="Name"
                            placeholder="Your Name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <Input
                            name="email"
                            label="Email"
                            placeholder="Your Email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            name="subject"
                            label="Subject"
                            placeholder="How can we help?"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Message</label>
                            <textarea
                                name="message"
                                rows={4}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border-grey)',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="Type your message here..."
                                required
                                value={formData.message}
                                onChange={handleChange}
                            />
                        </div>
                        <Button type="submit">Send Message</Button>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            {isSubmitted && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--white)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                cursor: 'pointer',
                                color: 'var(--text-grey)'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <CheckCircle size={48} color="var(--success-green)" />
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Success!</h3>
                        <p style={{ color: 'var(--text-grey)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                            The query has been submitted and you will hear back from us soon.
                        </p>

                        <Button fullWidth onClick={handleClose}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
