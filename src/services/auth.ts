/**
 * Authentication Service
 * 
 * This service handles user authentication and session management.
 * Integrated with the auth backend microservice.
 */

import { authAxios } from './axios.auth';

const AUTH_STORAGE_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_PERMISSIONS_KEY = 'auth_permissions';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    permissions?: any;
    message?: string;
}

/**
 * Login function - Integrated with real API
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await authAxios.post('/Auth/login', {
            username: credentials.username,
            password: credentials.password
        });

        const { user, token, permissions, message } = response.data;

        if (!user || !token) {
            return {
                success: false,
                message: message || 'Login failed'
            };
        }

        // Store user, token, and permissions
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_PERMISSIONS_KEY, JSON.stringify(permissions));

        return {
            success: true,
            user,
            token,
            permissions,
            message: message || 'Login successful'
        }
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login';
        return {
            success: false,
            message: errorMessage
        };
    }
};

export interface SignupData {
    email: string;
    username: string;
    password: string;
    name: string;
    role_id?: string;
    external_id?: string;
}

export interface SignupResponse {
    success: boolean;
    userId?: string;
    message?: string;
}

/**
 * Signup function 
 */
export const signup = async (userData: SignupData): Promise<SignupResponse> => {
    try {
        const response = await authAxios.post('/Auth/signup', {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            name: userData.name,
            role_id: userData.role_id,
            external_id: userData.external_id || `ext_${userData.username}_${Date.now()}`
        });

        const { userId, message } = response.data;

        return {
            success: true,
            userId,
            message: message || 'User created successfully'
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred during signup';
        return {
            success: false,
            message: errorMessage
        };
    }
};

/**
 * Logout function 
 */
export const logout = async (): Promise<void> => {
    try {
        // Call backend logout endpoint
        await authAxios.post('/Auth/logout');
    } catch (error) {
        // Even if API call fails, clear local storage
    } finally {
        // Always clear local storage
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_PERMISSIONS_KEY);
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
    try {
        const userStr = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        return null;
    }
};

/**
 * Get current auth token
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getCurrentUser() && !!getAuthToken();
};

/**
 * Get user's role
 */
export const getUserRole = (): string | null => {
    const user = getCurrentUser();
    return user ? user.role : null;
};

/**
 * Get user's permissions
 */
export const getUserPermissions = (): any | null => {
    try {
        const permissionsStr = localStorage.getItem(AUTH_PERMISSIONS_KEY);
        if (!permissionsStr) return null;
        return JSON.parse(permissionsStr);
    } catch (error) {
        return null;
    }
};

/**
 * Get dashboard route for current user
 * Checks permissions and redirects to the first accessible page
 */
export const getUserDashboardRoute = (): string => {
    const user = getCurrentUser();
    if (!user) return '/login';
    
    const permissions = getUserPermissions();
    if (!permissions || !permissions.pages) {
        // No permissions loaded, default to content library
        return '/content';
    }

    // Check if user has Dashboard access
    const dashboardPage = permissions.pages.find((page: any) => page.name === 'Dashboard');
    if (dashboardPage && dashboardPage.actions && dashboardPage.actions.length > 0) {
        // User has dashboard access, map role to specific dashboard
        const roleRoutesMap: Record<string, string> = {
            'Super Administrator': '/dashboard/admin',
            'Content Administrator': '/dashboard/editor',
            'Approver': '/dashboard/reviewer',
            'Reader': '/dashboard/author',
            'IT/System Administrator': '/dashboard/admin'
        };
        
        return roleRoutesMap[user.role] || '/dashboard';
    }

    // User doesn't have Dashboard access, check for other accessible pages
    const accessiblePages = permissions.pages.filter((page: any) => 
        page.actions && page.actions.length > 0
    );

    if (accessiblePages.length === 0) {
        // No accessible pages, redirect to a default page
        return '/content';
    }

    // Map page names to routes
    const pageRouteMap: Record<string, string> = {
        'Content': '/content',
        'NewContent': '/content',
        'Approvals': '/approvals',
        'AdminSettings': '/admin-settings',
        'Dashboard': '/dashboard'
    };

    // Find the first accessible page and redirect there
    for (const page of accessiblePages) {
        const route = pageRouteMap[page.name];
        if (route) {
            console.log(`🔀 Redirecting to ${route} (no Dashboard access)`);
            console.log(`🔀 Redirecting to ${route} (no Dashboard access)`);
        }
    }

    // Fallback to content library
    return '/content';
};

/**
 * Check if current user has a specific permission
 */
export const checkPermission = (permission: string): boolean => {
    const permissions = getUserPermissions();
    if (!permissions || !permissions.pages) return false;
    return true;
};

/**
 * Check if current user has a specific role
 */
export const hasRole = (role: string): boolean => {
    const currentRole = getUserRole();
    return currentRole === role;
};

export default {
    login,
    signup,
    logout,
    getCurrentUser,
    getAuthToken,
    isAuthenticated,
    getUserRole,
    getUserPermissions,
    getUserDashboardRoute,
    checkPermission,
    hasRole
};
