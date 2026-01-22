/**
 * Authentication Service
 * 
 * This service handles user authentication and session management.
 * Currently uses mock credentials, but structured to easily integrate with a real API.
 * 
 * To integrate with your backend API:
 * 1. Replace the mock validation in `login()` with an API call
 * 2. Update the response handling to match your API's response structure
 * 3. The role-based routing will work automatically
 */

import {
    User,
    UserRole,
    validateCredentials,
    getDashboardRoute,
    hasPermission
} from '@demo/constants/mockCredentials';

const AUTH_STORAGE_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}

/**
 * Login function
 * 
 * MOCK IMPLEMENTATION:
 * Currently validates against mock credentials
 * 
 * API INTEGRATION:
 * Replace the mock validation with:
 * ```
 * const response = await axios.post('/api/auth/login', credentials);
 * const { user, token } = response.data;
 * ```
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // MOCK: Validate against mock credentials
        const user = validateCredentials(credentials.username, credentials.password);

        if (!user) {
            return {
                success: false,
                message: 'Invalid username or password'
            };
        }

        // MOCK: Generate a fake token
        const token = `mock_token_${user.id}_${Date.now()}`;

        // Store user and token
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        return {
            success: true,
            user,
            token,
            message: 'Login successful'
        };

        /* 
        // API INTEGRATION EXAMPLE:
        const response = await axios.post('/api/auth/login', {
          username: credentials.username,
          password: credentials.password
        });
    
        const { user, token } = response.data;
    
        // Store user and token
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
    
        return {
          success: true,
          user,
          token,
          message: 'Login successful'
        };
        */
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'An error occurred during login'
        };
    }
};

/**
 * Logout function
 */
export const logout = (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);

    // API INTEGRATION: Call logout endpoint if needed
    // await axios.post('/api/auth/logout');
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
export const getUserRole = (): UserRole | null => {
    const user = getCurrentUser();
    return user ? user.role : null;
};

/**
 * Get dashboard route for current user
 */
export const getUserDashboardRoute = (): string => {
    const user = getCurrentUser();
    return user ? getDashboardRoute(user) : '/login';
};

/**
 * Check if current user has a specific permission
 */
export const checkPermission = (permission: string): boolean => {
    const user = getCurrentUser();
    return user ? hasPermission(user, permission) : false;
};

/**
 * Check if current user has a specific role
 */
export const hasRole = (role: UserRole): boolean => {
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

    // MOCK: Just check if user and token exist
    return true;

    /*
    // API INTEGRATION EXAMPLE:
    try {
      const response = await axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.valid;
    } catch (error) {
      logout();
      return false;
    }
    */
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

        // MOCK: Update local storage
        const updatedUser = { ...currentUser, ...updates };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

        return {
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully'
        };

        /*
        // API INTEGRATION EXAMPLE:
        const token = getAuthToken();
        const response = await axios.put('/api/users/profile', updates, {
          headers: { Authorization: `Bearer ${token}` }
        });
    
        const updatedUser = response.data.user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    
        return {
          success: true,
          user: updatedUser,
          message: 'Profile updated successfully'
        };
        */
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to update profile'
        };
    }
};

export default {
    login,
    logout,
    getCurrentUser,
    getAuthToken,
    isAuthenticated,
    getUserRole,
    getUserDashboardRoute,
    checkPermission,
    hasRole,
    verifySession,
    updateUserProfile
};
