/**
 * Editor Service
 * 
 * This service handles page editor operations:
 * - EMag (Electronic Magazine) creation and management
 * - Page creation and management
 * - HTML data storage
 */

import axios from 'axios';
import CONFIG from '@demo/config';

const EDITOR_API_URL = `${CONFIG.EDITOR_API_URL}/editor`;

// ============================================
// INTERFACES
// ============================================

export interface EMag {
    _id?: string;
    content_version_id: string;
    htmlData: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Page {
    _id?: string;
    eMag_id: string;
    page_number: number;
    page_type?: string; // e.g., 'cover', 'content', 'back'
    page_data?: string; // JSON string of page content
    createdAt?: Date;
    updatedAt?: Date;
}

// ============================================
// EMAG API
// ============================================

/**
 * Create a new EMag
 */
export const createEMag = async (emagData: Partial<EMag>): Promise<any> => {
    try {
        const response = await axios.post(`${EDITOR_API_URL}/emag`, emagData);
        return {
            success: true,
            data: response.data,
            message: 'EMag created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create EMag'
        };
    }
};

/**
 * Get all EMags for a content version
 */
export const getEMagsByContentVersion = async (contentVersionId: string): Promise<EMag[]> => {
    try {
        const response = await axios.get(`${EDITOR_API_URL}/content-versions/${contentVersionId}/emag`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update an EMag
 */
export const updateEMag = async (id: string, emagData: Partial<EMag>): Promise<any> => {
    try {
        const response = await axios.put(`${EDITOR_API_URL}/emag/${id}`, emagData);
        return {
            success: true,
            data: response.data,
            message: 'EMag updated successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update EMag'
        };
    }
};

// ============================================
// PAGE API
// ============================================

/**
 * Create a new page
 */
export const createPage = async (pageData: Partial<Page>): Promise<any> => {
    try {
        const response = await axios.post(`${EDITOR_API_URL}/pages`, pageData);
        return {
            success: true,
            data: response.data,
            message: 'Page created successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create page'
        };
    }
};

/**
 * Get all pages for an EMag
 */
export const getPagesByEMag = async (emagId: string): Promise<Page[]> => {
    try {
        const response = await axios.get(`${EDITOR_API_URL}/emag/${emagId}/pages`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update a page
 */
export const updatePage = async (id: string, pageData: Partial<Page>): Promise<any> => {
    try {
        const response = await axios.put(`${EDITOR_API_URL}/pages/${id}`, pageData);
        return {
            success: true,
            data: response.data,
            message: 'Page updated successfully'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update page'
        };
    }
};

// ============================================
// EXPORTS
// ============================================

export default {
    createEMag,
    getEMagsByContentVersion,
    updateEMag,
    createPage,
    getPagesByEMag,
    updatePage
};
