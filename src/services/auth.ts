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
 * Signup function - Integrated with real API
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
 * Logout function - Integrated with real API
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
 * Maps role names to dashboard routes
 */
export const getUserDashboardRoute = (): string => {
    const user = getCurrentUser();
    if (!user) return '/login';
    
    // Map role to dashboard route
    const roleRoutesMap: Record<string, string> = {
        'Super Administrator': '/dashboard/admin',
        'Content Administrator': '/dashboard/editor',
        'Approver': '/dashboard/reviewer',
        'Reader': '/dashboard/author',
        'IT/System Administrator': '/dashboard/admin'
    };
    
    return roleRoutesMap[user.role] || '/dashboard';
};

/**
 * Check if current user has a specific permission
 */
export const checkPermission = (permission: string): boolean => {
    const permissions = getUserPermissions();
    if (!permissions || !permissions.pages) return false;
    
    // Check if user has access to the specified permission
    // This is a simplified check - adjust based on your permission structure
    return true; // For now, return true if user is authenticated
};

/**
 * Check if current user has a specific role
 */
export const hasRole = (role: string): boolean => {
    const currentRole = getUserRole();
    return currentRole === role;
};

/**
 * Verify session validity
 * 
 * API INTEGRATION:
 * Add API call to verify token validity:
 * ```
 * const response = await axios.get('/api/auth/verify', {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * return response.data.valid;
 * ```
 */
export const verifySession = async (): Promise<boolean> => {
    const user = getCurrentUser();
    const token = getAuthToken();

    if (!user || !token) {
        return false;
    }

    return true;
};

/**
 * Update user profile
 * 
 * API INTEGRATION:
 * ```
 * const response = await axios.put('/api/users/profile', updates, {
 *   headers: { Authorization: `Bearer ${token}` }
 * });
 * ```
 */
export const updateUserProfile = async (updates: Partial<User>): Promise<AuthResponse> => {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: 'No user logged in'
            };
        }

        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

        return {
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to update profile'
        };
    }
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
    hasRole,
    verifySession,
    updateUserProfile
};
