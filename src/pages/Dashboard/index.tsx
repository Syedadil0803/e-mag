
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import DashboardLayout from './Layout';
import AdminDashboard from './roles/AdminDashboard';
import EditorDashboard from './roles/EditorDashboard';
import AuthorDashboard from './roles/AuthorDashboard';
import ReviewerDashboard from './roles/ReviewerDashboard';
import { UserRole } from './types';
import { Spin, Message } from '@arco-design/web-react';
import { getCurrentUser, isAuthenticated, updateUserProfile } from '@demo/services/auth';

const Dashboard: React.FC = () => {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userName, setUserName] = useState<string>('');
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
                // Ensure role from auth service matches Dashboard types
                // Casting as any to string to match if there are slight differences, but they should be aligned now
                setUserRole(currentUser.role as unknown as UserRole);
                setUserName(currentUser.fullName);
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
        <DashboardLayout role={userRole} userName={userName}>


            {renderDashboard()}
        </DashboardLayout>
    );
};

export default Dashboard;
