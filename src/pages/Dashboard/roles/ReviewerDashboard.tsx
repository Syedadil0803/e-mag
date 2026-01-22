
import React, { useState } from 'react';
import { Button, Select, Tag } from '@arco-design/web-react';
import { IconPlus, IconRight } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import styles from '../components/Components.module.scss';

const ReviewerDashboard: React.FC = () => {
    const history = useHistory();
    const [statusFilter, setStatusFilter] = useState('Status: optional');
    const [authorFilter, setAuthorFilter] = useState('Author: US#1');
    const [dateFilter, setDateFilter] = useState('Revised Dates');

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return { bg: '#E8FFEA', color: '#00B42A' };
            case 'pending':
                return { bg: '#FFF7E8', color: '#FF7D00' };
            case 'under review':
                return { bg: '#E8F3FF', color: '#4E7DD9' };
            case 'rejected':
                return { bg: '#FFECE8', color: '#F53F3F' };
            default:
                return { bg: '#F2F3F5', color: '#86909c' };
        }
    };

    const handleNewContent = () => {
        history.push('/editor');
    };

    const queueData = [
        {
            key: '1',
            title: 'School Prospectus',
            subtitle: '12a/mush-ram - 3 min ago',
            author: 'Actmsi Brooks',
            authorSubtitle: 'Unit#: 71 with ago',
            submitted: '1 minute ago',
            reviewDrafts: '',
            status: 'Approved'
        },
        {
            key: '2',
            title: 'Engineering Quarterly',
            subtitle: 'Draft #45 - 15 min ago',
            author: 'Sarah Johnson',
            authorSubtitle: 'Dept: Engineering',
            submitted: '15 minutes ago',
            reviewDrafts: '2 drafts',
            status: 'Pending'
        },
        {
            key: '3',
            title: 'Physics Research Paper',
            subtitle: 'Version 2.1 - 1 hour ago',
            author: 'Michael Chen',
            authorSubtitle: 'Science Dept',
            submitted: '1 hour ago',
            reviewDrafts: '1 draft',
            status: 'Under Review'
        },
        {
            key: '4',
            title: 'Business Analytics Report',
            subtitle: 'Q4 2025 - 2 hours ago',
            author: 'Emily Rodriguez',
            authorSubtitle: 'Commerce Faculty',
            submitted: '2 hours ago',
            reviewDrafts: '',
            status: 'Approved'
        },
    ];

    const historyData = [
        {
            key: '1',
            title: 'Alumni Magazine',
            subtitle: '6/21 ther#89 over 31/2h Aver ago',
            author: 'David Smith',
            authorSubtitle: 'Barret h-num ago',
            date: '5 minutes ago',
            status: 'Approved'
        },
        {
            key: '2',
            title: 'Research Digest',
            subtitle: '12a/ther#80 over 3 min ago',
            author: 'George Clecter',
            authorSubtitle: 'Bowers 8/20 with ago',
            date: '4 minutes ago',
            status: 'Approved'
        },
        {
            key: '3',
            title: 'Computer Science Journal',
            subtitle: 'Vol 12, Issue 3 - Yesterday',
            author: 'Jennifer Lee',
            authorSubtitle: 'CS Department',
            date: '1 day ago',
            status: 'Approved'
        },
        {
            key: '4',
            title: 'Mathematics Quarterly',
            subtitle: 'Spring Edition 2025',
            author: 'Robert Taylor',
            authorSubtitle: 'Math Faculty',
            date: '2 days ago',
            status: 'Rejected'
        },
        {
            key: '5',
            title: 'Student Newsletter',
            subtitle: 'January 2026 Edition',
            author: 'Amanda White',
            authorSubtitle: 'Student Affairs',
            date: '3 days ago',
            status: 'Approved'
        },
        {
            key: '6',
            title: 'Chemistry Lab Report',
            subtitle: 'Experiment Series #12',
            author: 'Dr. James Wilson',
            authorSubtitle: 'Chemistry Dept',
            date: '1 week ago',
            status: 'Approved'
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1d2129' }}>Reviewer Dashboard</h2>
                <Button
                    type="primary"
                    icon={<IconPlus />}
                    style={{
                        borderRadius: 8,
                        height: 40,
                        padding: '0 20px',
                        fontWeight: 600,
                        background: '#4E7DD9',
                        border: 'none'
                    }}
                    onClick={handleNewContent}
                >
                    New Content
                </Button>
            </div>

            {/* My Approval Queue */}
            <div className={styles.reviewerSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1d2129' }}>My Approval Queue</h3>
                </div>

                <div className={styles.reviewerTable}>
                    {/* Table Header */}
                    <div className={styles.reviewerTableHeader}>
                        <div style={{ flex: '1 1 280px' }}>
                            <Select
                                placeholder="Status: optional"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                size="small"
                                style={{ width: '100%', fontSize: 12 }}
                                bordered={false}
                                arrowIcon={null}
                            />
                        </div>
                        <div style={{ flex: '1 1 220px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>Author</div>
                        <div style={{ flex: '0 0 140px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>Submitted →</div>
                        <div style={{ flex: '0 0 140px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>Review Drafts</div>
                        <div style={{ flex: '0 0 130px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>Status</div>
                        <div style={{ flex: '0 0 40px' }}></div>
                    </div>

                    {/* Table Rows */}
                    {queueData.map((item) => (
                        <div key={item.key} className={styles.reviewerTableRow} style={{ cursor: 'pointer' }}>
                            <div style={{ flex: '1 1 280px' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: 12, color: '#86909c' }}>{item.subtitle}</div>
                            </div>
                            <div style={{ flex: '1 1 220px' }}>
                                <div style={{ fontSize: 14, color: '#1d2129', marginBottom: 4 }}>{item.author}</div>
                                <div style={{ fontSize: 12, color: '#86909c' }}>{item.authorSubtitle}</div>
                            </div>
                            <div style={{ flex: '0 0 140px', fontSize: 13, color: '#4e5969' }}>{item.submitted}</div>
                            <div style={{ flex: '0 0 140px', fontSize: 13, color: '#4e5969' }}>{item.reviewDrafts}</div>
                            <div style={{ flex: '0 0 130px' }}>
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

            {/* Review History */}
            <div className={styles.reviewerSection} style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1d2129' }}>Review History</h3>
                </div>

                <div className={styles.reviewerTable}>
                    {/* Table Header */}
                    <div className={styles.reviewerTableHeader}>
                        <div style={{ flex: '1 1 280px' }}>
                            <Select
                                placeholder="Author: US#1"
                                value={authorFilter}
                                onChange={setAuthorFilter}
                                size="small"
                                style={{ width: '100%', fontSize: 12 }}
                                bordered={false}
                                arrowIcon={null}
                            />
                        </div>
                        <div style={{ flex: '1 1 220px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>Author</div>
                        <div style={{ flex: '0 0 180px' }}>
                            <Select
                                placeholder="Revised Dates"
                                value={dateFilter}
                                onChange={setDateFilter}
                                size="small"
                                style={{ width: '100%', fontSize: 12 }}
                                bordered={false}
                            />
                        </div>
                        <div style={{ flex: '0 0 130px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>Status</div>
                        <div style={{ flex: '0 0 40px' }}></div>
                    </div>

                    {/* Table Rows */}
                    {historyData.map((item) => (
                        <div key={item.key} className={styles.reviewerTableRow} style={{ cursor: 'pointer' }}>
                            <div style={{ flex: '1 1 280px' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                    {item.title}
                                </div>
                                <div style={{ fontSize: 12, color: '#86909c' }}>{item.subtitle}</div>
                            </div>
                            <div style={{ flex: '1 1 220px' }}>
                                <div style={{ fontSize: 14, color: '#1d2129', marginBottom: 4 }}>{item.author}</div>
                                <div style={{ fontSize: 12, color: '#86909c' }}>{item.authorSubtitle}</div>
                            </div>
                            <div style={{ flex: '0 0 180px', fontSize: 13, color: '#4e5969' }}>{item.date}</div>
                            <div style={{ flex: '0 0 130px' }}>
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
        </div>
    );
};

export default ReviewerDashboard;
