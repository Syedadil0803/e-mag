/**
 * Mock Credentials for Role-Based Authentication
 * 
 * This file contains predefined user credentials for different roles.
 * When integrating with a real API, map these roles to your backend user roles.
 * 
 * Usage:
 * 1. Import this file in your login/auth service
 * 2. Validate credentials against MOCK_USERS array
 * 3. Store the user's role in localStorage/session after successful login
 * 4. Use the role to determine which dashboard to display
 */

export enum UserRole {
    EDITOR = 'Editor',
    AUTHOR = 'Author',
    ADMIN = 'Admin',
    REVIEWER = 'Reviewer'
}

export interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    role: UserRole;
    fullName: string;
    department?: string;
    permissions: string[];
}

/**
 * Mock user credentials
 * In production, these will be validated against your backend API
 */
export const MOCK_USERS: User[] = [
    {
        id: 1,
        username: 'editor',
        password: 'editor123',
        email: 'editor@university.edu',
        role: UserRole.EDITOR,
        fullName: 'John Editor',
        department: 'Editorial Department',
        permissions: [
            'view_all_content',
            'edit_content',
            'publish_content',
            'manage_drafts',
            'assign_reviewers',
            'approve_content'
        ]
    },
    {
        id: 2,
        username: 'author',
        password: 'author123',
        email: 'author@university.edu',
        role: UserRole.AUTHOR,
        fullName: 'Jane Author',
        department: 'Computer Science',
        permissions: [
            'create_content',
            'edit_own_content',
            'submit_for_review',
            'view_own_content'
        ]
    },
    {
        id: 3,
        username: 'admin',
        password: 'admin123',
        email: 'admin@university.edu',
        role: UserRole.ADMIN,
        fullName: 'Admin User',
        department: 'Administration',
        permissions: [
            'full_access',
            'manage_users',
            'manage_roles',
            'view_analytics',
            'system_settings',
            'manage_departments',
            'view_all_content',
            'delete_content'
        ]
    },
    {
        id: 4,
        username: 'reviewer',
        password: 'reviewer123',
        email: 'reviewer@university.edu',
        role: UserRole.REVIEWER,
        fullName: 'Bob Reviewer',
        department: 'Review Board',
        permissions: [
            'view_assigned_content',
            'review_content',
            'approve_content',
            'reject_content',
            'add_comments'
        ]
    }
];

/**
 * Additional test users for each role
 */
export const ADDITIONAL_TEST_USERS: User[] = [
    {
        id: 5,
        username: 'editor2',
        password: 'editor456',
        email: 'editor2@university.edu',
        role: UserRole.EDITOR,
        fullName: 'Sarah Editor',
        department: 'Editorial Department',
        permissions: [
            'view_all_content',
            'edit_content',
            'publish_content',
            'manage_drafts',
            'assign_reviewers',
            'approve_content'
        ]
    },
    {
        id: 6,
        username: 'author2',
        password: 'author456',
        email: 'author2@university.edu',
        role: UserRole.AUTHOR,
        fullName: 'Michael Author',
        department: 'Engineering',
        permissions: [
            'create_content',
            'edit_own_content',
            'submit_for_review',
            'view_own_content'
        ]
    },
    {
        id: 7,
        username: 'reviewer2',
        password: 'reviewer456',
        email: 'reviewer2@university.edu',
        role: UserRole.REVIEWER,
        fullName: 'Emily Reviewer',
        department: 'Review Board',
        permissions: [
            'view_assigned_content',
            'review_content',
            'approve_content',
            'reject_content',
            'add_comments'
        ]
    }
];

/**
 * Combine all users
 */
export const ALL_MOCK_USERS = [...MOCK_USERS, ...ADDITIONAL_TEST_USERS];

/**
 * Helper function to validate credentials
 * @param username - Username or email
 * @param password - Password
 * @returns User object if valid, null otherwise
 */
export const validateCredentials = (username: string, password: string): User | null => {
    const user = ALL_MOCK_USERS.find(
        (u) => (u.username === username || u.email === username) && u.password === password
    );
    return user || null;
};

/**
 * Helper function to get user by role
 * @param role - User role
 * @returns Array of users with the specified role
 */
export const getUsersByRole = (role: UserRole): User[] => {
    return ALL_MOCK_USERS.filter((u) => u.role === role);
};

/**
 * Helper function to check if user has permission
 * @param user - User object
 * @param permission - Permission to check
 * @returns boolean
 */
export const hasPermission = (user: User, permission: string): boolean => {
    return user.permissions.includes(permission) || user.permissions.includes('full_access');
};

/**
 * Dashboard route mapping based on role
 */
export const DASHBOARD_ROUTES: Record<UserRole, string> = {
    [UserRole.EDITOR]: '/dashboard/editor',
    [UserRole.AUTHOR]: '/dashboard/author',
    [UserRole.ADMIN]: '/dashboard/admin',
    [UserRole.REVIEWER]: '/dashboard/reviewer'
};

/**
 * Get dashboard route for user
 * @param user - User object
 * @returns Dashboard route
 */
export const getDashboardRoute = (user: User): string => {
    return DASHBOARD_ROUTES[user.role] || '/dashboard';
};
