/**
 * Permission Hook
 * 
 * This hook provides easy access to user permissions throughout the app.
 * It uses the permissions data that was fetched during login and stored in localStorage.
 */

import React, { useState, useEffect } from 'react';

interface Permission {
  name: string;
  action: string;
  tabs?: Array<{
    name: string;
    action: string;
  }>;
}

interface PermissionsData {
  pages: Permission[];
}

/**
 * Hook to access user permissions
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get permissions from localStorage (stored during login)
    const permissionsData = localStorage.getItem('auth_permissions');
    if (permissionsData) {
      try {
        const parsedPermissions = JSON.parse(permissionsData);
        setPermissions(parsedPermissions || { pages: [] });
      } catch (error) {
        setPermissions({ pages: [] });
      }
    } else {
      setPermissions({ pages: [] });
    }
    setLoading(false);
  }, []);

  /**
   * Check if user has permission to access a page
   */
  const canAccessPage = (pageName: string): boolean => {
    if (!permissions) return false;

    const page = permissions.pages.find(p =>
      p.name.toLowerCase() === pageName.toLowerCase()
    );

    if (!page) return false;

    // Check the action - if it's 'hide', return false
    // Allow 'view', 'access', or any other action except 'hide'
    return page.action.toLowerCase() !== 'hide';
  };

  /*
   * Check if user has permission to perform an action on a page
   */
  const canPerformAction = (pageName: string, action: string): boolean => {
    if (!permissions) return false;

    const page = permissions.pages.find(p =>
      p.name.toLowerCase() === pageName.toLowerCase()
    );

    if (!page) {
      // If we're looking for a specific page and it doesn't exist,
      // only allow 'all' if the user has an 'all' page defined
      const globalAll = permissions.pages.find(p => p.name.toLowerCase() === 'all');
      if (globalAll) {
        return globalAll.action.toLowerCase() === 'all' ||
          globalAll.action.toLowerCase() === action.toLowerCase();
      }
      return false;
    }

    // If the page action is 'hide', user cannot perform any action
    if (page.action.toLowerCase() === 'hide') return false;

    // Check if action matches or if user has 'all' permission
    return page.action.toLowerCase() === action.toLowerCase() ||
      page.action.toLowerCase() === 'all';
  };

  /**
   * Check if user has permission to access a specific tab on a page
   */
  const canAccessTab = (pageName: string, tabName: string): boolean => {
    if (!permissions) return false;

    const page = permissions.pages.find(p =>
      p.name.toLowerCase() === pageName.toLowerCase()
    );

    if (!page) return false;

    // If no tabs defined in permissions, user doesn't have tab-level access
    // This is secure by default - explicit permissions required
    if (!page.tabs || page.tabs.length === 0) return false;

    const tab = page.tabs.find(t =>
      t.name.toLowerCase() === tabName.toLowerCase()
    );

    if (!tab) return false;

    // Check the action - if it's 'hide', return false
    // Allow 'view', 'access', or any other action except 'hide'
    return tab.action.toLowerCase() !== 'hide';
  };

  /**
   * Check if user can perform an action on a specific tab
   */
  const canPerformActionOnTab = (pageName: string, tabName: string, action: string): boolean => {
    if (!permissions) return false;

    const page = permissions.pages.find(p =>
      p.name.toLowerCase() === pageName.toLowerCase()
    );

    if (!page || !page.tabs) return false;

    const tab = page.tabs.find(t =>
      t.name.toLowerCase() === tabName.toLowerCase()
    );

    if (!tab) return false;

    return tab.action.toLowerCase() === action.toLowerCase() ||
      tab.action.toLowerCase() === 'all';
  };

  /**
   * Check if user is admin (has access to all)
   */
  const isAdmin = (): boolean => {
    if (!permissions) return false;
    return permissions.pages.some(page =>
      page.name.toLowerCase() === 'all' && page.action.toLowerCase() === 'all'
    );
  };

  /**
   * Get all accessible pages
   */
  const getAccessiblePages = (): string[] => {
    if (!permissions) return [];
    return permissions.pages.map(page => page.name);
  };

  return {
    permissions,
    loading,
    canAccessPage,
    canPerformAction,
    canAccessTab,
    canPerformActionOnTab,
    isAdmin,
    getAccessiblePages
  };
};

/**
 * Higher-order component to protect routes/components based on permissions
 */
export const withPermission = (
  Component: React.ComponentType<any>,
  requiredPage: string,
  requiredAction?: string
) => {
  return (props: any) => {
    const { canAccessPage, canPerformAction, loading } = usePermissions();

    if (loading) {
      return <div>Loading...</div>;
    }

    const hasAccess = requiredAction
      ? canPerformAction(requiredPage, requiredAction)
      : canAccessPage(requiredPage);

    if (!hasAccess) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
