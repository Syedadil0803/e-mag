import React, { useState, useEffect } from 'react';
import { Button, Tag, Avatar, Select, Spin, Modal, Input, Message } from '@arco-design/web-react';
import { IconPlus, IconRight } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import styles from '../components/Components.module.scss';
import { usePermissions } from '../../../hooks/usePermissions';
import { getAllContent, createContent, Content } from '@demo/services/content';
import { getCurrentUser } from '@demo/services/auth';

const AuthorDashboard: React.FC = () => {
    const history = useHistory();
    const { canPerformAction } = usePermissions();
    const currentUser = getCurrentUser();
    const [sortFilter, setSortFilter] = useState('ALL');
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newContentTitle, setNewContentTitle] = useState('');
    const [creating, setCreating] = useState(false);

    const canCreateContent = canPerformAction('NewContent', 'View');

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        try {
            const data = await getAllContent();
            // Filter to show only current user's content
            const userContent = data.filter(c => c.created_by === currentUser?.id);
            setContents(userContent);
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewContent = () => {
        setCreateModalVisible(true);
    };

    const handleCreateContent = async () => {
        if (!newContentTitle.trim()) {
            Message.warning('Please enter a title');
            return;
        }

        setCreating(true);
        try {
            const result = await createContent({
                title: newContentTitle,
                created_by: currentUser?.id
            });

            if (result.success) {
                Message.success('Content created successfully!');
                setCreateModalVisible(false);
                setNewContentTitle('');

                // Navigate to template selection with the new content ID
                const contentId = result.data._id;
                history.push(`/create-magazine?content_id=${contentId}&title=${encodeURIComponent(newContentTitle)}`);
            } else {
                Message.error(result.message || 'Failed to create content');
            }
        } catch (error) {
            Message.error('Failed to create content');
            console.error('Error creating content:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleViewContent = (contentId: string) => {
        history.push(`/editor?content_id=${contentId}`);
    };

    // Calculate stats from real data
    const stats = [
        { title: 'Total Content', count: contents.length, color: '#4E7DD9' },
        {
            title: 'This Month', count: contents.filter(c => {
                const created = new Date(c.created_at!);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length, color: '#FF7D00'
        },
        {
            title: 'This Week', count: contents.filter(c => {
                const created = new Date(c.created_at!);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return created >= weekAgo;
            }).length, color: '#14C9C9'
        },
        {
            title: 'Today', count: contents.filter(c => {
                const created = new Date(c.created_at!);
                const now = new Date();
                return created.toDateString() === now.toDateString();
            }).length, color: '#00B42A'
        },
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

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const recentActivity = [
        { id: 1, user: 'Linda Brooks', time: '53 min ago', avatar: 'LB' },
        { id: 2, user: 'Michael Clark', time: '23 min ago', avatar: 'MC' },
        { id: 3, user: 'David Smith', time: '12 min ago', avatar: 'DS' },
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
                            <div style={{ flex: '0 0 180px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>
                                Last Updated
                            </div>
                            <div style={{ flex: '0 0 120px', fontSize: 12, color: '#86909c', fontWeight: 500 }}>
                                Status
                            </div>
                            <div style={{ flex: '0 0 40px' }}></div>
                        </div>

                        {/* Table Rows */}
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Spin size={32} />
                            </div>
                        ) : contents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#86909c' }}>
                                <p>No content yet. Create your first magazine!</p>
                            </div>
                        ) : (
                            contents.map((item) => (
                                <div
                                    key={item._id}
                                    className={styles.reviewerTableRow}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleViewContent(item._id!)}
                                >
                                    <div style={{ flex: '1 1 300px' }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#86909c' }}>
                                            Created {getTimeAgo(item.created_at!)}
                                        </div>
                                    </div>
                                    <div style={{ flex: '0 0 180px', fontSize: 13, color: '#4e5969' }}>
                                        {getTimeAgo(item.updated_at!)}
                                    </div>
                                    <div style={{ flex: '0 0 120px' }}>
                                        <Tag
                                            style={{
                                                background: getStatusColor('draft').bg,
                                                color: getStatusColor('draft').color,
                                                border: 'none',
                                                borderRadius: 4,
                                                padding: '4px 12px',
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}
                                        >
                                            Draft
                                        </Tag>
                                    </div>
                                    <div style={{ flex: '0 0 40px', display: 'flex', justifyContent: 'center' }}>
                                        <IconRight style={{ fontSize: 16, color: '#86909c', cursor: 'pointer' }} />
                                    </div>
                                </div>
                            ))
                        )}
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

            {/* Create Content Modal */}
            <Modal
                title="Create New Content"
                visible={createModalVisible}
                onOk={handleCreateContent}
                onCancel={() => {
                    setCreateModalVisible(false);
                    setNewContentTitle('');
                }}
                confirmLoading={creating}
                okText="Create"
            >
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500
                    }}>
                        Content Title
                    </label>
                    <Input
                        placeholder="Enter magazine title"
                        value={newContentTitle}
                        onChange={setNewContentTitle}
                        onPressEnter={handleCreateContent}
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
};

export default AuthorDashboard;
