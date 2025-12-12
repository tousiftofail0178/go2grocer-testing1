"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './page.module.css';

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
            <LoginForm />
        </React.Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const { loginB2B, isLoading, error } = useAuthStore();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !password) return;
        try {
            await loginB2B(userId, password);
            router.push(redirectUrl);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>B2B Client Login</h1>
                <p className={styles.subtitle}>Enter your User ID and Password to continue</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="User ID"
                        placeholder="Enter User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        // icon={<UserIcon size={18} />} 
                        type="text"
                        required
                    />
                    <Input
                        label="Password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock size={18} />}
                        type="password"
                        required
                    />
                    <Button
                        fullWidth
                        disabled={isLoading || !userId || !password}
                        type="submit"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-grey)' }}>
                    New to Go2Grocer B2B? <a href={`/signup${redirectUrl !== '/' ? `?redirect=${redirectUrl}` : ''}`} style={{ color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}>Register Business</a>
                </div>

                <div className={styles.footer}>
                    <p>By continuing, you agree to our Terms & Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
}
