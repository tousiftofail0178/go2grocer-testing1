"use client";

import React, { useState, useEffect } from 'react';
import { Search, Edit2, Check, X, Shield, User as UserIcon } from 'lucide-react';
import styles from './users.module.css';

interface User {
    id: number;
    email: string;
    role: string;
    name: string;
    createdAt: string;
    isVerified?: boolean;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editingUser, setEditingUser] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        role: '',
        isVerified: false,
        name: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, roleFilter, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by role
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const startEdit = (user: User) => {
        setEditingUser(user.id);
        setEditForm({
            role: user.role,
            isVerified: user.isVerified || false,
            name: user.name || '',
        });
    };

    const cancelEdit = () => {
        setEditingUser(null);
    };

    const saveEdit = async (userId: number) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ User updated successfully!');
                setEditingUser(null);
                fetchUsers(); // Refresh the list
            } else {
                alert(`❌ Error: ${data.error || 'Failed to update user'}`);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('An error occurred while updating the user');
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin':
                return styles.badgeAdmin;
            case 'business_owner':
                return styles.badgeOwner;
            case 'business_manager':
                return styles.badgeManager;
            case 'consumer':
                return styles.badgeConsumer;
            default:
                return styles.badgeDefault;
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading users...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>User Management</h1>
                    <p className={styles.subtitle}>Manage user accounts and roles</p>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <span>Total Users</span>
                        <strong>{users.length}</strong>
                    </div>
                    <div className={styles.statCard}>
                        <span>Business Owners</span>
                        <strong>{users.filter(u => u.role === 'business_owner').length}</strong>
                    </div>
                </div>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={styles.roleFilter}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="business_manager">Business Manager</option>
                    <option value="consumer">Consumer</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Verified</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>
                                    <div className={styles.emailCell}>
                                        <UserIcon size={16} />
                                        {user.email}
                                    </div>
                                </td>
                                <td>
                                    {editingUser === user.id ? (
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        user.name || '-'
                                    )}
                                </td>
                                <td>
                                    {editingUser === user.id ? (
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            className={styles.editSelect}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="business_owner">Business Owner</option>
                                            <option value="business_manager">Business Manager</option>
                                            <option value="consumer">Consumer</option>
                                        </select>
                                    ) : (
                                        <span className={`${styles.roleBadge} ${getRoleBadgeClass(user.role)}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {editingUser === user.id ? (
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={editForm.isVerified}
                                                onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                                            />
                                            <span>Verified</span>
                                        </label>
                                    ) : (
                                        user.isVerified ? (
                                            <span className={styles.verifiedBadge}>
                                                <Shield size={14} /> Verified
                                            </span>
                                        ) : (
                                            <span className={styles.unverifiedBadge}>Unverified</span>
                                        )
                                    )}
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {editingUser === user.id ? (
                                        <div className={styles.editActions}>
                                            <button
                                                className={styles.saveButton}
                                                onClick={() => saveEdit(user.id)}
                                            >
                                                <Check size={16} /> Save
                                            </button>
                                            <button
                                                className={styles.cancelButton}
                                                onClick={cancelEdit}
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className={styles.editButton}
                                            onClick={() => startEdit(user)}
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className={styles.emptyState}>
                        <UserIcon size={48} />
                        <p>No users found matching your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
