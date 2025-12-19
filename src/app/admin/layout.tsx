"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    BarChart3,
    Settings,
    LogOut,
    Home,
    Globe,
    Wallet,
    FileText,
    Search,
    ChevronDown,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './admin.module.css';

// Separate component to handle open/close state locally
function NavItem({ item, pathname }: { item: any, pathname: string }) {
    const Icon = item.icon;
    const isCurrent = pathname === item.href;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isChildActive = hasSubItems && item.subItems.some((sub: any) => pathname === sub.href);

    // Auto-open if child is active OR if the item itself is active
    const [isOpen, setIsOpen] = useState(isChildActive || isCurrent);

    // Update open state if navigation changes from outside
    useEffect(() => {
        if (isChildActive || isCurrent) setIsOpen(true);
    }, [isChildActive, isCurrent]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.navItemContainer}>
            <Link
                href={item.href}
                className={`${styles.navLink} ${isCurrent ? styles.active : ''}`}
            >
                <div className={styles.navIconWrapper}>
                    <Icon size={20} />
                </div>
                <span className={styles.navLabel}>{item.name}</span>
                {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                {hasSubItems && (
                    <div
                        className={styles.navChevron}
                        onClick={handleToggle}
                        style={{ padding: '4px', margin: '-4px', cursor: 'pointer', display: 'flex', zIndex: 10 }}
                    >
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                )}
            </Link>

            {/* Submenu with animation classes */}
            <div className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ''}`}>
                <div className={styles.subMenuInner}>
                    {item.subItems?.map((sub: any) => (
                        <Link
                            key={sub.href}
                            href={sub.href}
                            className={`${styles.subNavLink} ${pathname === sub.href ? styles.subActive : ''}`}
                        >
                            {sub.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        // Simple client-side protection
        const checkAuth = async () => {
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            const isAdmin = user?.id === 'G2G-001' || user?.name === 'System Admin';

            if (!isAdmin) {
                router.push('/');
                return;
            }

            setIsAuthorized(true);
        };

        checkAuth();
    }, [isAuthenticated, user, router]);

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results: any[] = [];

        navItems.forEach(item => {
            if (item.name.toLowerCase().includes(query)) {
                results.push({ ...item, parent: null });
            }
            if (item.subItems) {
                item.subItems.forEach(sub => {
                    if (sub.name.toLowerCase().includes(query)) {
                        results.push({ ...sub, icon: item.icon, parent: item.name });
                    }
                });
            }
        });

        setSearchResults(results);
    }, [searchQuery]);

    const navItems = [
        { name: 'Home', href: '/admin', icon: LayoutDashboard },
        {
            name: 'Orders',
            href: '/admin/orders',
            icon: ShoppingBag,
            badge: 5,
            subItems: [
                { name: 'Drafts', href: '/admin/orders/drafts' },
                { name: 'Abandoned checkouts', href: '/admin/orders/abandoned' }
            ]
        },
        {
            name: 'Products',
            href: '/admin/products',
            icon: Package,
            subItems: [
                { name: 'Collections', href: '/admin/products/collections' },
                { name: 'Inventory', href: '/admin/products/inventory' },
                { name: 'Purchase orders', href: '/admin/products/purchase-orders' },
                { name: 'Transfers', href: '/admin/products/transfers' },
                { name: 'Gift cards', href: '/admin/products/gift-cards' }
            ]
        },
        {
            name: 'Customers',
            href: '/admin/customers',
            icon: Users,
            subItems: [
                { name: 'Segments', href: '/admin/customers/segments' }
            ]
        },
        {
            name: 'Content',
            href: '/admin/content',
            icon: FileText,
            subItems: [
                { name: 'Metaobjects', href: '/admin/content/metaobjects' },
                { name: 'Files', href: '/admin/content/files' },
                { name: 'Menus', href: '/admin/content/menus' },
                { name: 'Blog posts', href: '/admin/content/blog-posts' }
            ]
        },
        {
            name: 'Markets',
            href: '/admin/markets',
            icon: Globe,
            subItems: [
                { name: 'Catalogs', href: '/admin/markets/catalogs' }
            ]
        },
        { name: 'Finance', href: '/admin/finance', icon: Wallet },
        {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
            subItems: [
                { name: 'Reports', href: '/admin/analytics/reports' },
                { name: 'Live View', href: '/admin/analytics/live' }
            ]
        },
        {
            name: 'Marketing',
            href: '/admin/marketing',
            icon: BarChart3,
            subItems: [
                { name: 'Campaigns', href: '/admin/marketing/campaigns' },
                { name: 'Automations', href: '/admin/marketing/automations' }
            ]
        },
        { name: 'Discounts', href: '/admin/discounts', icon: Package }
    ];

    if (!isAuthorized) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading Admin Panel...
            </div>
        );
    }

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        G
                    </div>
                </div>

                <nav className={styles.nav}>
                    <div className={styles.navSection}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Check if this item is currently active (top level or child)
                            const isCurrentRoute = pathname === item.href;
                            const isChildActive = item.subItems?.some(sub => pathname === sub.href);
                            const isActive = isCurrentRoute || isChildActive;

                            // Auto-expand if active, otherwise use internal state (not implemented yet, relying on CSS hover/group for now or simple active expansion)
                            // We will use CSS checkbock hack or simple React state if we wanted click-to-open. 
                            // For "really nice", let's make it always expanded if active, but visually distinct.
                            // Actually user said "when the subcategories open", implying toggle. Let's do simple React state for toggle.
                            // We need to move the map inside a component or use state in the parent. 
                            // Using a simple CollapsibleNavItem component would be cleaner but I'll inline it for now with a key.

                            return (
                                <NavItem
                                    key={item.href}
                                    item={item}
                                    pathname={pathname}
                                />
                            );
                        })}
                    </div>

                    <div className={styles.navDivider} />

                    <div className={styles.navSection}>
                        <h4 className={styles.navSectionTitle}>Sales channels</h4>
                        <Link href="/" className={styles.navLink}>
                            <div className={styles.channelIcon}>OS</div>
                            Online Store
                            <div className={styles.externalLinkIcon}>↗</div>
                        </Link>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link href="/admin/settings" className={styles.navLink}>
                        <Settings size={20} />
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.main}>
                {/* Top Header */}
                <header className={styles.topBar}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: '400px', background: '#f1f2f4', borderRadius: '4px', padding: '0.25rem 0.5rem', marginRight: '1rem', position: 'relative' }}>
                        <Search size={16} color="#666" style={{ marginRight: '0.5rem' }} />
                        <input
                            type="text"
                            placeholder="Search admin..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '0.9rem'
                            }}
                        />
                        {searchQuery && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                borderRadius: '0 0 4px 4px',
                                padding: '0.5rem',
                                zIndex: 50,
                                maxHeight: '300px',
                                overflowY: 'auto',
                                border: '1px solid #e5e7eb'
                            }}>
                                {searchResults.length > 0 ? (
                                    searchResults.map((result, index) => (
                                        <Link
                                            key={index}
                                            href={result.href}
                                            onClick={() => setSearchQuery('')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '0.5rem',
                                                textDecoration: 'none',
                                                color: '#374151',
                                                borderRadius: '4px',
                                                fontSize: '0.9rem'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{ marginRight: '0.5rem' }}>
                                                {result.icon && <result.icon size={16} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{result.name}</div>
                                                {result.parent && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>in {result.parent}</div>}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div style={{ padding: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>No results found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div style={{ fontWeight: 500 }}>{user?.name}</div>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666'
                        }}
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </header>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
}
