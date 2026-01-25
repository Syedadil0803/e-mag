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
    created_by?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ContentVersion {
    _id?: string;
    content_id: string;
    version_number: string;
    state: string; // e.g., 'draft', 'review', 'approved', 'published'
    is_live: boolean;
    created_by?: string;
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
 * Set a version as live
 */
export const setLiveVersion = async (versionId: string, contentId: string): Promise<any> => {
    try {
        const response = await axios.put(
            `${CONTENT_API_URL}/versions/${versionId}/live`,
            { contentId }
        );
        return {
            success: true,
            message: 'Version set as live successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to set live version'
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
    setLiveVersion
};
