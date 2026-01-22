
import React from 'react';
import { Layout, Menu, Button, Avatar, Badge, Space, Breadcrumb, Dropdown } from '@arco-design/web-react';
import {
    IconDashboard,
    IconFile,
    IconCheckCircle,
    IconSettings,
    IconNotification,
    IconPlus,
    IconPoweroff,
} from '@arco-design/web-react/icon';
import { useHistory, useLocation } from 'react-router-dom';
import { logout } from '@demo/services/auth';
import { UserRole } from './types';
import styles from './Dashboard.module.scss';

const { Sider, Header, Content } = Layout;
const MenuItem = Menu.Item;

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: UserRole;
    userName: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, role, userName }) => {
    const history = useHistory();
    const location = useLocation();

    const menuItems = [
        {
            key: 'dashboard',
            icon: <IconDashboard />,
            label: 'Dashboard',
            path: '/dashboard',
        },
        {
            key: 'content',
            icon: <IconFile />,
            label: 'Content',
            path: '/content',
        },
        {
            key: 'approvals',
            icon: <IconCheckCircle />,
            label: 'Approvals',
            path: '/approvals',
        },
        {
            key: 'settings',
            icon: <IconSettings />,
            label: 'Settings',
            path: '/settings',
        },
    ];

    const handleNewContent = () => {
        history.push('/editor');
    };

    return (
        <Layout className={styles.layout}>
            <Sider
                breakpoint="lg"
                width={240}
                collapsedWidth={80}
                className={styles.sider}
            >
                <div className={styles.logoContainer}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L4 8L16 14L28 8L16 2Z" fill="#2D5A9E" />
                        <path d="M4 14L16 20L28 14" stroke="#2D5A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 20L16 26L28 20" stroke="#2D5A9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className={styles.logoText}>University</span>
                </div>
                <Menu
                    selectedKeys={[menuItems.find(item => location.pathname.startsWith(item.path))?.key || 'dashboard']}
                    className={styles.menu}
                    onClickMenuItem={(key) => {
                        const item = menuItems.find(i => i.key === key);
                        if (item) history.push(item.path);
                    }}
                >
                    {menuItems.map((item) => (
                        <MenuItem key={item.key}>
                            {item.icon}
                            {item.label}
                        </MenuItem>
                    ))}
                </Menu>
                <div className={styles.siderFooter}>
                    <div className={styles.logoutBtn} onClick={() => {
                        logout();
                        history.push('/');
                    }}>
                        <IconPoweroff className={styles.logoutIcon} />
                        <span>Logout</span>
                    </div>
                    <p className={styles.poweredBy}>Powered by Aairavx</p>
                </div>
            </Sider>
            <Layout>
                <Header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.roleTitle}>{role} Dashboard</span>
                    </div>
                    <div className={styles.headerRight}>
                        <Space size={20}>
                            <Badge count={5} dot>
                                <IconNotification className={styles.icon} />
                            </Badge>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{userName}</span>
                                <Dropdown
                                    droplist={
                                        <Menu>
                                            <Menu.Item key='logout' onClick={() => {
                                                logout();
                                                history.push('/');
                                            }}>
                                                Logout
                                            </Menu.Item>
                                        </Menu>
                                    }
                                    position='br'
                                >
                                    <Avatar size={32} style={{ backgroundColor: '#f0f2f5', cursor: 'pointer' }}>
                                        <img src="https://api.dicebear.com/7.x/initials/svg?seed=JD&backgroundColor=2d5a9e" alt="avatar" />
                                    </Avatar>
                                </Dropdown>
                            </div>
                        </Space>
                    </div>
                </Header>
                <Content className={styles.content}>
                    <div className={styles.contentInner}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
