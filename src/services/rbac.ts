/**
 * RBAC Service
 * 
 * This service handles Role-Based Access Control operations:
 * - Resources (Pages/Modules)
 * - Policies (Access rules)
 * - Actions (Permissions)
 * - Authorization checks
 */

import { authAxios } from './axios.auth';

// ============================================
// INTERFACES
// ============================================

export interface Resource {
    _id?: string;
    resourceName: string;
    description: string;
    resourceType?: string;
    isActive?: boolean;
}

export interface Policy {
    _id?: string;
    roleId: string;
    resourceId: string;
    actionId: string;
}

export interface Action {
    _id?: string;
    actionName: string;
    description: string;
}

export interface AuthorizationRequest {
    userId: string;
    resourceId: string;
    actionId: string;
}

export interface AuthorizationResponse {
    allowed: boolean;
    message?: string;
}

// ============================================
// RESOURCES API
// ============================================

/**
 * Create a new resource
 */
export const createResource = async (resourceData: Resource): Promise<any> => {
    try {
        const response = await authAxios.post('/Resources/create', resourceData);
        return {
            success: true,
            data: response.data,
            message: 'Resource created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create resource'
        };
    }
};

/**
 * Get all resources
 */
export const getResources = async (): Promise<Resource[]> => {
    try {
        const response = await authAxios.get('/Resources/getAll');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get resource by ID
 */
export const getResourceById = async (id: string): Promise<Resource> => {
    try {
        const response = await authAxios.get(`/Resources/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update resource
 */
export const updateResource = async (id: string, resourceData: Partial<Resource>): Promise<any> => {
    try {
        const response = await authAxios.put(`/Resources/${id}`, resourceData);
        return {
            success: true,
            data: response.data,
            message: 'Resource updated successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update resource'
        };
    }
};

/**
 * Delete resource
 */
export const deleteResource = async (id: string): Promise<any> => {
    try {
        const response = await authAxios.delete(`/Resources/${id}`);
        return {
            success: true,
            data: response.data,
            message: 'Resource deleted successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete resource'
        };
    }
};

// ============================================
// POLICIES API
// ============================================

/**
 * Create a new policy
 */
export const createPolicy = async (policyData: Policy): Promise<any> => {
    try {
        const response = await authAxios.post('/Policies/create', policyData);
        return {
            success: true,
            data: response.data,
            message: 'Policy created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create policy'
        };
    }
};

/**
 * Get all policies
 */
export const getPolicies = async (): Promise<Policy[]> => {
    try {
        const response = await authAxios.get('/Policies/getAll');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get policy by ID
 */
export const getPolicyById = async (id: string): Promise<Policy> => {
    try {
        const response = await authAxios.get(`/Policies/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update policy
 */
export const updatePolicy = async (id: string, policyData: Partial<Policy>): Promise<any> => {
    try {
        const response = await authAxios.put(`/Policies/${id}`, policyData);
        return {
            success: true,
            data: response.data,
            message: 'Policy updated successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update policy'
        };
    }
};

/**
 * Delete policy
 */
export const deletePolicy = async (id: string): Promise<any> => {
    try {
        const response = await authAxios.delete(`/Policies/${id}`);
        return {
            success: true,
            data: response.data,
            message: 'Policy deleted successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete policy'
        };
    }
};

// ============================================
// ACTIONS API
// ============================================

/**
 * Create a new action
 */
export const createAction = async (actionData: Action): Promise<any> => {
    try {
        const response = await authAxios.post('/Actions/create', actionData);
        return {
            success: true,
            data: response.data,
            message: 'Action created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create action'
        };
    }
};

/**
 * Get all actions
 */
export const getActions = async (): Promise<Action[]> => {
    try {
        const response = await authAxios.get('/Actions/getAll');
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get action by ID
 */
export const getActionById = async (id: string): Promise<Action> => {
    try {
        const response = await authAxios.get(`/Actions/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update action
 */
export const updateAction = async (id: string, actionData: Partial<Action>): Promise<any> => {
    try {
        const response = await authAxios.put(`/Actions/${id}`, actionData);
        return {
            success: true,
            data: response.data,
            message: 'Action updated successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update action'
        };
    }
};

/**
 * Delete action
 */
export const deleteAction = async (id: string): Promise<any> => {
    try {
        const response = await authAxios.delete(`/Actions/${id}`);
        return {
            success: true,
            data: response.data,
            message: 'Action deleted successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete action'
        };
    }
};

// ============================================
// AUTHORIZER API
// ============================================

/**
 * Check if user has permission to perform action on resource
 */
export const checkAuthorization = async (authRequest: AuthorizationRequest): Promise<AuthorizationResponse> => {
    try {
        const response = await authAxios.post('/Authorizer/getPermissions', authRequest);
        return {
            allowed: response.data.allowed || false,
            message: response.data.message
        };
    } catch (error: any) {
        return {
            allowed: false,
            message: error.response?.data?.message || 'Authorization check failed'
        };
    }
};

/**
 * Get all permissions for current user
 */
export const getUserPermissions = async (): Promise<any> => {
    try {
        const response = await authAxios.post('/Authorizer/getPermissions', {});
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<any> => {
    try {
        const response = await authAxios.get(`/Users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<any[]> => {
    try {
        const response = await authAxios.get('/Users/getAll');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// ============================================
// EXPORTS
// ============================================

export default {
    // Resources
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource,
    
    // Policies
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicy,
    deletePolicy,
    
    // Actions
    createAction,
    getActions,
    getActionById,
    updateAction,
    deleteAction,
    
    // Authorization
    checkAuthorization,
    getUserPermissions,
    
    // Users
    getUserById,
    getAllUsers
};
