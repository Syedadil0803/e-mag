import React from 'react';
import { useHistory } from 'react-router-dom';
import DashboardLayout from '../Dashboard/Layout';
import { getCurrentUser } from '@demo/services/auth';
import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import { UserRole } from '../Dashboard/types';
import { usePermissions } from '../../hooks/usePermissions';

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

const ContentPage: React.FC = () => {
    const history = useHistory();
    const currentUser = getCurrentUser();
    const userRole = currentUser?.role ? mapBackendRoleToUserRole(currentUser.role) : 'Editor';
    const { canPerformAction } = usePermissions();

    // Check if user can create new content
    const canCreateContent = canPerformAction('NewContent', 'View');

    const handleNewContent = () => {
        history.push('/create-magazine');
    };

    return (
        <DashboardLayout
            role={userRole}
            userName={currentUser?.name || 'User'}
            userAvatar={currentUser?.avatar}
        >
            <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Content</h2>
                    {canCreateContent && (
                        <Button
                            type="primary"
                            icon={<IconPlus />}
                            onClick={handleNewContent}
                            style={{
                                borderRadius: 8,
                                height: 38,
                                padding: '0 20px',
                                fontWeight: 600,
                                background: '#4E7DD9',
                                border: 'none'
                            }}
                        >
                            New Content
                        </Button>
                    )}
                </div>
                <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    color: '#86909c'
                }}>
                    <p style={{ fontSize: '16px', marginBottom: '8px' }}>Content management page</p>
                    <p style={{ fontSize: '14px' }}>Your content library will appear here</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ContentPage;
