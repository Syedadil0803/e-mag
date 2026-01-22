
import React from 'react';
import { Tag, Select } from '@arco-design/web-react';
import { IconRight } from '@arco-design/web-react/icon';
import styles from '../components/Components.module.scss';

const AdminDashboard: React.FC = () => {
    const stats = [
        { title: 'Drafts', count: 12, color: '#4E7DD9' },
        { title: 'Under Review', count: 5, color: '#FF7D00' },
        { title: 'Approved', count: 8, color: '#14C9C9' },
        { title: 'Published', count: 20, color: '#4E7DD9' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft':
                return { bg: '#E8F3FF', color: '#4E7DD9' };
            case 'under review':
                return { bg: '#FFF7E8', color: '#FF7D00' };
            case 'approved':
                return { bg: '#E8FFEA', color: '#00B42A' };
            case 'published':
                return { bg: '#E8F3FF', color: '#4E7DD9' };
            default:
                return { bg: '#F2F3F5', color: '#86909c' };
        }
    };

    const recentContentData = [
        {
            key: '1',
            title: 'Campus Newsletter',
            subtitle: '12a-int-a#30 man - 3 min ago',
            updated: '3 min ago',
            status: 'Draft'
        },
        {
            key: '2',
            title: 'Research Digest',
            subtitle: '12a-int-a#30 over 3 min ago',
            updated: '3 min ago',
            status: 'Under Review'
        },
        {
            key: '3',
            title: 'Alumni Magazine',
            subtitle: '12a-int-a#30 man - 1 min ago',
            updated: '1 min ago',
            status: 'Approved'
        },
        {
            key: '4',
            title: 'Faculty Updates',
            subtitle: '443-int-a#30 man - 3 min ago',
            updated: '3 min ago',
            status: 'Published'
        },
    ];

    const pendingApprovalsData = [
        { key: '1', title: 'Annual Report', subtitle: 'Carissa-Huan- 3 min ago' },
        { key: '2', title: 'Law Faculty Journal', subtitle: '12a-inta-#1 man- 3 min ago' },
        { key: '3', title: 'Science Weekly', subtitle: '50-1 mant-#1 man- 3 min ago' },
        { key: '4', title: 'Thud Inothus 180', subtitle: '' },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1d2129' }}>Admin Dashboard</h2>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
                {/* Recent Content Section */}
                <div className={styles.reviewerSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1d2129' }}>Recent Content</h3>
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
                            <div style={{ flex: '0 0 140px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>
                                Status
                            </div>
                            <div style={{ flex: '0 0 40px' }}></div>
                        </div>

                        {/* Table Rows */}
                        {recentContentData.map((item) => (
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
                                <div style={{ flex: '0 0 140px' }}>
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

                {/* Pending Approvals Section */}
                <div className={styles.reviewerSection}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 16, color: '#1d2129' }}>
                        Pending Approvals
                    </h3>

                    <div className={styles.reviewerTable}>
                        {/* Table Header */}
                        <div className={styles.reviewerTableHeader}>
                            <div style={{ flex: '1', fontSize: 12, color: '#86909c', fontWeight: 500 }}>
                                Article
                            </div>
                            <div style={{ flex: '0 0 40px' }}></div>
                        </div>

                        {/* List Items */}
                        {pendingApprovalsData.map((item) => (
                            <div key={item.key} className={styles.reviewerTableRow} style={{ cursor: 'pointer' }}>
                                <div style={{ flex: '1' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                        {item.title}
                                    </div>
                                    {item.subtitle && (
                                        <div style={{ fontSize: 12, color: '#86909c' }}>{item.subtitle}</div>
                                    )}
                                </div>
                                <div style={{ flex: '0 0 40px', display: 'flex', justifyContent: 'center' }}>
                                    <IconRight style={{ fontSize: 16, color: '#86909c', cursor: 'pointer' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
