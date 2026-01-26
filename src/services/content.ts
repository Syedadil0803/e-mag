/**
 * Content Service
 * 
 * This service handles content management operations:
 * - Content creation and management
 * - Content versioning
 * - Version state management
 */

import axios from 'axios';
import CONFIG from '@demo/config';

const CONTENT_API_URL = `${CONFIG.CONTENT_API_URL}/Content`;

// ============================================
// INTERFACES
// ============================================

export interface Content {
    _id?: string;
    title: string;
    academic_year?: string;
    department?: string;
    created_by?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ContentVersion {
    _id?: string;
    content_id: string;
    version_number: string;
    state: 'draft' | 'under_review' | 'approved' | 'published' | 'archived';
    is_live: boolean;
    created_by?: string;
    approved_by?: string;
    created_at?: Date;
    updated_at?: Date;
}


// ============================================
// CONTENT API
// ============================================

/**
 * Create a new content
 */
export const createContent = async (contentData: Partial<Content>): Promise<any> => {
    try {
        const response = await axios.post(`${CONTENT_API_URL}/create`, contentData);
        return {
            success: true,
            data: response.data,
            message: 'Content created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create content'
        };
    }
};

/**
 * Get all content
 */
export const getAllContent = async (): Promise<Content[]> => {
    try {
        const response = await axios.get(`${CONTENT_API_URL}/getAll`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get content by ID
 */
export const getContentById = async (id: string): Promise<Content> => {
    try {
        const response = await axios.get(`${CONTENT_API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// CONTENT VERSION API
// ============================================

/**
 * Create a new version for content
 */
export const createContentVersion = async (
    contentId: string,
    versionData: Partial<ContentVersion>
): Promise<any> => {
    try {
        const response = await axios.post(
            `${CONTENT_API_URL}/${contentId}/createVersions`,
            versionData
        );
        return {
            success: true,
            data: response.data,
            message: 'Version created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create version'
        };
    }
};

/**
 * Get all versions for a content
 */
export const getContentVersions = async (contentId: string): Promise<ContentVersion[]> => {
    try {
        const response = await axios.get(`${CONTENT_API_URL}/${contentId}/versions`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Submit a version for review
 */
export const submitForReview = async (versionId: string): Promise<any> => {
    try {
        const response = await axios.put(
            `${CONTENT_API_URL}/versions/${versionId}/submit-for-review`
        );
        return {
            success: true,
            data: response.data,
            message: 'Submitted for review successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to submit for review'
        };
    }
};

/**
 * Approve a version
 */
export const approveVersion = async (versionId: string, approvedBy: string): Promise<any> => {
    try {
        const response = await axios.put(
            `${CONTENT_API_URL}/versions/${versionId}/approve`,
            { approvedBy }
        );
        return {
            success: true,
            data: response.data,
            message: 'Version approved successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to approve version'
        };
    }
};

/**
 * Publish a version
 */
export const publishVersion = async (versionId: string, contentId: string): Promise<any> => {
    try {
        const response = await axios.put(
            `${CONTENT_API_URL}/versions/${versionId}/publish`,
            { contentId }
        );
        return {
            success: true,
            data: response.data,
            message: 'Version published successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to publish version'
        };
    }
};

// ============================================
// EXPORTS
// ============================================

export default {
    createContent,
    getAllContent,
    getContentById,
    createContentVersion,
    getContentVersions,
    submitForReview,
    approveVersion,
    publishVersion
};
