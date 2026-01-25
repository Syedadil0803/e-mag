import React, { useState } from 'react';
import { Button, Tag, Avatar, Select } from '@arco-design/web-react';
import { IconPlus, IconRight } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import styles from '../components/Components.module.scss';
import { usePermissions } from '../../../hooks/usePermissions';

const AuthorDashboard: React.FC = () => {
    const history = useHistory();
    const { canPerformAction } = usePermissions();
    const [sortFilter, setSortFilter] = useState('PUBLISHED');

    const canCreateContent = canPerformAction('NewContent', 'View');

    const handleNewContent = () => {
        history.push('/editor');
    };

    const stats = [
        { title: 'Drafts', count: 8, color: '#4E7DD9' },
        { title: 'Under Review', count: 3, color: '#FF7D00' },
        { title: 'Approved', count: 5, color: '#14C9C9' },
        { title: 'Published', count: 12, color: '#4E7DD9' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft':
                return { bg: '#E8F3FF', color: '#4E7DD9' };
            case 'under review':
                return { bg: '#FFF7E8', color: '#FF7D00' };
            case 'approved':
                return { bg: '#E8FFEA', color: '#00B42A' };
            default:
                return { bg: '#F2F3F5', color: '#86909c' };
        }
    };

    const myContentData = [
        {
            key: '1',
            title: 'Campus Newsletter',
            subtitle: '6a-new-clarifying(9)',
            updated: '14 minutes ago',
            status: 'Draft'
        },
        {
            key: '2',
            title: 'Research Digest',
            subtitle: '12a-int-30 over ca him ago',
            updated: '2 minutes ago',
            status: 'Draft'
        },
        {
            key: '3',
            title: 'Alumni Magazine',
            subtitle: '12a-int-a#30 man - lot ago',
            updated: '2 minutes ago',
            status: 'Draft'
        },
    ];

    const recentActivity = [
        { id: 1, user: 'Linda Brooks', time: '53 minth ago', avatar: 'LB' },
        { id: 2, user: 'Michael Clark', time: '23min ago', avatar: 'MC' },
        { id: 3, user: 'David Smith', time: '12 minth ago', avatar: 'DS' },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1d2129' }}>Author Dashboard</h2>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#ffffff',
                            borderRadius: 12,
                            padding: '20px',
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ fontSize: 13, color: '#86909c', marginBottom: 8, fontWeight: 500 }}>
                            {stat.title}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#1d2129' }}>
                            {stat.count}
                        </div>
                        {/* Decorative wave */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 80,
                                height: 40,
                                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                                borderRadius: '100% 0 0 0'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                {/* My Content Section */}
                <div className={styles.reviewerSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1d2129' }}>My Content</h3>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <Select
                                value={sortFilter}
                                onChange={setSortFilter}
                                size="small"
                                style={{ width: 120, fontSize: 12 }}
                                bordered={true}
                                options={[
                                    { label: 'PUBLISHED', value: 'PUBLISHED' },
                                    { label: 'DRAFT', value: 'DRAFT' },
                                    { label: 'APPROVED', value: 'APPROVED' }
                                ]}
                            />
                            {canCreateContent && (
                                <Button
                                    type="primary"
                                    icon={<IconPlus />}
                                    style={{
                                        borderRadius: 8,
                                        height: 36,
                                        padding: '0 16px',
                                        fontWeight: 600,
                                        background: '#4E7DD9',
                                        border: 'none',
                                        fontSize: 14
                                    }}
                                    onClick={handleNewContent}
                                >
                                    New Content
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={styles.reviewerTable}>
                        {/* Table Header */}
                        <div className={styles.reviewerTableHeader}>
                            <div style={{ flex: '1 1 300px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>
                                Article
                            </div>
                            <div style={{ flex: '0 0 180px' }}>
                                <Select
                                    placeholder="Last Updated"
                                    size="small"
                                    style={{ width: '100%', fontSize: 12 }}
                                    bordered={false}
                                />
                            </div>
                            <div style={{ flex: '0 0 120px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>
                                Status
                            </div>
                            <div style={{ flex: '0 0 40px' }}></div>
                        </div>

                        {/* Table Rows */}
                        {myContentData.map((item) => (
                            <div key={item.key} className={styles.reviewerTableRow} style={{ cursor: 'pointer' }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#86909c' }}>{item.subtitle}</div>
                                </div>
                                <div style={{ flex: '0 0 180px', fontSize: 13, color: '#4e5969' }}>
                                    {item.updated}
                                </div>
                                <div style={{ flex: '0 0 120px' }}>
                                    <Tag
                                        style={{
                                            background: getStatusColor(item.status).bg,
                                            color: getStatusColor(item.status).color,
                                            border: 'none',
                                            borderRadius: 4,
                                            padding: '4px 12px',
                                            fontSize: 12,
                                            fontWeight: 600
                                        }}
                                    >
                                        {item.status}
                                    </Tag>
                                </div>
                                <div style={{ flex: '0 0 40px', display: 'flex', justifyContent: 'center' }}>
                                    <IconRight style={{ fontSize: 16, color: '#86909c', cursor: 'pointer' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className={styles.reviewerSection}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 20, color: '#1d2129' }}>
                        Recent Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {recentActivity.map((activity) => (
                            <div
                                key={activity.id}
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: '8px 0',
                                    borderBottom: activity.id !== recentActivity.length ? '1px solid #f0f0f0' : 'none',
                                    paddingBottom: 16
                                }}
                            >
                                <Avatar
                                    size={44}
                                    style={{
                                        background: 'linear-gradient(135deg, #4E7DD9 0%, #14C9C9 100%)',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        fontSize: 14
                                    }}
                                >
                                    {activity.avatar}
                                </Avatar>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                        {activity.user}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#86909c' }}>{activity.time}</div>
                                </div>
                                <IconRight style={{ fontSize: 16, color: '#86909c' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorDashboard;
