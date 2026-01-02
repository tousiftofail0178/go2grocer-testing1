// Permission definitions for role-based access control
export const PERMISSIONS = {
    // Products
    VIEW_PRODUCTS: 'view_products',
    MANAGE_PRODUCTS: 'manage_products',

    // Orders
    VIEW_ORDERS: 'view_orders',
    MANAGE_ORDERS: 'manage_orders',
    VIEW_OWN_BUSINESS_ORDERS: 'view_own_business_orders',

    // Customers
    VIEW_CUSTOMERS: 'view_customers',
    MANAGE_CUSTOMERS: 'manage_customers',

    // Content
    VIEW_CONTENT: 'view_content',
    MANAGE_CONTENT: 'manage_content',

    // Discounts & Marketing  
    MANAGE_DISCOUNTS: 'manage_discounts',
    MANAGE_MARKETING: 'manage_marketing',

    // Business Management
    MANAGE_OWN_BUSINESSES: 'manage_own_businesses',
    APPLY_NEW_BUSINESS: 'apply_new_business',
    APPLY_MANAGER: 'apply_manager',
    APPROVE_BUSINESSES: 'approve_businesses',
    APPROVE_MANAGERS: 'approve_managers',

    // System
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_FINANCE: 'view_finance',
    MANAGE_SETTINGS: 'manage_settings',
    FULL_ADMIN: 'full_admin',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    // G2G Admin - Full access to everything
    admin: [PERMISSIONS.FULL_ADMIN],

    // G2G Operations - Orders only
    g2g_operations: [
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.MANAGE_ORDERS,
    ],

    // G2G Social Media - Products, Content, Discounts, Marketing only
    g2g_social_media: [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.MANAGE_PRODUCTS,
        PERMISSIONS.VIEW_CONTENT,
        PERMISSIONS.MANAGE_CONTENT,
        PERMISSIONS.MANAGE_DISCOUNTS,
        PERMISSIONS.MANAGE_MARKETING,
    ],

    // Business Owner - Manage own businesses, apply for new ones
    business_owner: [
        PERMISSIONS.MANAGE_OWN_BUSINESSES,
        PERMISSIONS.APPLY_NEW_BUSINESS,
        PERMISSIONS.APPLY_MANAGER,
        PERMISSIONS.VIEW_OWN_BUSINESS_ORDERS,
    ],

    // Business Manager - View assigned business only
    business_manager: [
        PERMISSIONS.VIEW_OWN_BUSINESS_ORDERS,
    ],

    // Consumer - No admin permissions
    consumer: [],
};

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    // Full admin has all permissions
    return permissions.includes(PERMISSIONS.FULL_ADMIN) || permissions.includes(permission);
}

/**
 * Check if user role can access admin dashboard
 */
export function canAccessAdminDashboard(userRole: string): boolean {
    const adminRoles = ['admin', 'g2g_operations', 'g2g_social_media'];
    return adminRoles.includes(userRole);
}

/**
 * Get filtered navigation items based on user role
 */
export function getAccessibleRoutes(userRole: string): string[] {
    if (userRole === 'admin') {
        return ['*']; // Full access
    }

    const routePermissions: Record<string, Permission> = {
        '/admin/products': PERMISSIONS.MANAGE_PRODUCTS,
        '/admin/orders': PERMISSIONS.MANAGE_ORDERS,
        '/admin/customers': PERMISSIONS.MANAGE_CUSTOMERS,
        '/admin/content': PERMISSIONS.MANAGE_CONTENT,
        '/admin/discounts': PERMISSIONS.MANAGE_DISCOUNTS,
        '/admin/marketing': PERMISSIONS.MANAGE_MARKETING,
        '/admin/analytics': PERMISSIONS.VIEW_ANALYTICS,
        '/admin/finance': PERMISSIONS.VIEW_FINANCE,
        '/admin/settings': PERMISSIONS.MANAGE_SETTINGS,
    };

    return Object.keys(routePermissions).filter(route => {
        const requiredPermission = routePermissions[route];
        return hasPermission(userRole, requiredPermission);
    });
}
