"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Building2, User, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import styles from './requests.module.css';

interface Request {
    requestId: number;
    businessId: number;
    businessName: string;
    requestedBy: number;
    requesterEmail: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    requestStatus: string;
    createdAt: string;
}

export default function ManagerRequestsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/login');
            return;
        }
        fetchRequests();
    }, [user]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/manager-requests?status=pending');
            const data = await response.json();

            if (response.ok && data.requests) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: Request) => {
        console.log('🔵 Approve button clicked for request:', request.requestId);

        // REMOVED: Browser was auto-cancelling the confirm dialog
        // if (!confirm(`Approve manager account for ${request.firstName} ${request.lastName}?`)) {
        //     console.log('❌ User cancelled approval');
        //     return;
        // }

        console.log('✅ Processing approval for:', `${request.firstName} ${request.lastName}`);
        setProcessing(true);

        try {
            console.log('📤 Sending approval request to API...');
            const response = await fetch(`/api/admin/manager-requests/${request.requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve',
                    adminUserId: user?.id || null,
                }),
            });

            console.log('📥 API Response status:', response.status);
            const data = await response.json();
            console.log('📥 API Response data:', data);

            if (response.ok && data.success) {
                alert(`✅ ${request.firstName} ${request.lastName} approved as manager!`);
                setSelectedRequest(null);
                console.log('🔄 Refreshing requests list...');
                await fetchRequests(); // Refresh list
            } else {
                const errorMsg = `❌ Error: ${data.error || 'Failed to approve request'}`;
                console.error(errorMsg, data);
                alert(errorMsg);
            }
        } catch (error) {
            console.error('❌ Error approving request:', error);
            alert('An error occurred while approving the request. Check console for details.');
        } finally {
            console.log('✅ Processing complete');
            setProcessing(false);
        }
    };

    const handleReject = async (request: Request) => {
        console.log('🔵 Reject button clicked for request:', request.requestId);

        // REMOVED: Browser was auto-cancelling the confirm dialog
        // if (!confirm(`Reject manager request for ${request.firstName} ${request.lastName}?`)) {
        //     return;
        // }

        console.log('🚫 Processing rejection...');
        setProcessing(true);

        try {
            const response = await fetch(`/api/admin/manager-requests/${request.requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    adminUserId: user?.id || null,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert(`Request rejected`);
                setSelectedRequest(null);
                await fetchRequests();
            } else {
                alert(`❌ Error: ${data.error || 'Failed to reject request'}`);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('An error occurred while rejecting the request');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Manager Account Requests</h1>
                <p className={styles.subtitle}>Review and approve manager account requests from business owners</p>
            </div>

            {requests.length === 0 ? (
                <div className={styles.emptyState}>
                    <Clock size={48} className={styles.emptyIcon} />
                    <h3>No pending requests</h3>
                    <p>All manager account requests have been processed</p>
                </div>
            ) : (
                <div className={styles.requestsTable}>
                    <table>
                        <thead>
                            <tr>
                                <th>Manager Details</th>
                                <th>Business</th>
                                <th>Requested By</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr key={request.requestId}>
                                    <td>
                                        <div className={styles.managerInfo}>
                                            <div className={styles.name}>
                                                {request.firstName} {request.lastName}
                                            </div>
                                            <div className={styles.contact}>
                                                <Mail size={14} />
                                                {request.email}
                                            </div>
                                            <div className={styles.contact}>
                                                <Phone size={14} />
                                                {request.phoneNumber}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.businessInfo}>
                                            <Building2 size={16} />
                                            {request.businessName}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.requesterInfo}>
                                            <User size={14} />
                                            {request.requesterEmail}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.date}>
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.approveButton}
                                                onClick={() => handleApprove(request)}
                                                disabled={processing}
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>
                                            <button
                                                className={styles.rejectButton}
                                                onClick={() => handleReject(request)}
                                                disabled={processing}
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
