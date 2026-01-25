import React from 'react';
import { Tabs, Typography, Breadcrumb } from '@arco-design/web-react';
import DepartmentsTab from './Departments';
import RolesTab from './Roles';
import UsersTab from './Users';
import PoliciesTab from './Policies';
import DashboardLayout from '../Layout';
import { getCurrentUser } from '@demo/services/auth';
import { UserRole } from '../types';
import styles from '../Dashboard.module.scss';

const { TabPane } = Tabs;

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
    return roleMap[backendRole] || 'Admin';
};

const AdminSettings: React.FC = () => {
    const currentUser = getCurrentUser();
    const userRole = currentUser?.role ? mapBackendRoleToUserRole(currentUser.role) : 'Admin';

    return (
        <DashboardLayout
            role={userRole}
            userName={currentUser?.name || 'Admin'}
            userAvatar={currentUser?.avatar}
        >
            <div style={{ padding: '4px 0' }}>
                <div style={{ background: '#ffffff', borderRadius: 12, padding: '24px', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
                    <Tabs defaultActiveTab="roles" size="large">
                        <TabPane key="departments" title="Departments">
                            <div style={{ marginTop: 24 }}>
                                <DepartmentsTab />
                            </div>
                        </TabPane>
                        <TabPane key="roles" title="Roles">
                            <div style={{ marginTop: 24 }}>
                                <RolesTab />
                            </div>
                        </TabPane>
                        <TabPane key="users" title="Users">
                            <div style={{ marginTop: 24 }}>
                                <UsersTab />
                            </div>
                        </TabPane>
                        <TabPane key="policies" title="Policies">
                            <div style={{ marginTop: 24 }}>
                                <PoliciesTab />
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
