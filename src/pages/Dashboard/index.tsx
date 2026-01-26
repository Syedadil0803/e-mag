
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import DashboardLayout from './Layout';
import AdminDashboard from './roles/AdminDashboard';
import EditorDashboard from './roles/EditorDashboard';
import AuthorDashboard from './roles/AuthorDashboard';
import ReviewerDashboard from './roles/ReviewerDashboard';
import { UserRole } from './types';
import { Spin, Message } from '@arco-design/web-react';
import { getCurrentUser, isAuthenticated } from '@demo/services/auth';

const Dashboard: React.FC = () => {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const history = useHistory();

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated()) {
                Message.warning('Please login first');
                history.push('/');
                return;
            }

            const currentUser = getCurrentUser();
            if (currentUser) {
                // Map backend role names to frontend UserRole types
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

                const mappedRole = roleMap[currentUser.role] || 'Editor';
                console.log('🔑 Role mapping:', { backendRole: currentUser.role, mappedRole });

                setUserRole(mappedRole);
                setUserName(currentUser.name || (currentUser as any).fullName);
                setUserAvatar(currentUser.avatar);
            }
            setLoading(false);
        };

        checkAuth();
    }, [history]);



    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size={40} />
            </div>
        );
    }

    if (!userRole) return null;

    const renderDashboard = () => {
        switch (userRole) {
            case 'Admin':
                return <AdminDashboard />;
            case 'Editor':
                return <EditorDashboard />;
            case 'Author':
                return <AuthorDashboard />;
            case 'Reviewer':
                return <ReviewerDashboard />;
            default:
                return <EditorDashboard />;
        }
    };

    return (
        <DashboardLayout role={userRole} userName={userName} userAvatar={userAvatar}>


            {renderDashboard()}
        </DashboardLayout>
    );
};

export default Dashboard;
