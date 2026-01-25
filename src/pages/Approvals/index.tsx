import React from 'react';
import DashboardLayout from '../Dashboard/Layout';
import { getCurrentUser } from '@demo/services/auth';
import { UserRole } from '../Dashboard/types';

// Map backend role names to frontend UserRole types
const mapBackendRoleToUserRole = (backendRole: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
        'Super Administrator': 'Admin',
        'Content Administrator': 'Editor',
        'Approver': 'Reviewer',
        'Reader': 'Author',
        'IT/System Administrator': 'Admin',
        'Admin': 'Admin',
        'Editor': 'Editor',
        'Author': 'Author',
        'Reviewer': 'Reviewer'
    };
    return roleMap[backendRole] || 'Editor';
};

const ApprovalsPage: React.FC = () => {
    const currentUser = getCurrentUser();
    const userRole = currentUser?.role ? mapBackendRoleToUserRole(currentUser.role) : 'Reviewer';

    return (
        <DashboardLayout
            role={userRole}
            userName={currentUser?.name || 'User'}
            userAvatar={currentUser?.avatar}
        >
            <div style={{ padding: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Approvals</h2>
                <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    color: '#86909c'
                }}>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Approvals management page</p>
                    <p style={{ fontSize: '14px' }}>Pending approvals will appear here</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ApprovalsPage;
