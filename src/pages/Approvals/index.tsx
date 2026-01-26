import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Message, Modal, Space, Skeleton } from '@arco-design/web-react';
import { IconCheck, IconPublic, IconEye } from '@arco-design/web-react/icon';
import DashboardLayout from '../Dashboard/Layout';
import { getCurrentUser } from '@demo/services/auth';
import { UserRole } from '../Dashboard/types';
import services from '@demo/services';
import { ContentVersion } from '@demo/services/content';
import { usePermissions, withPermission } from '@demo/hooks/usePermissions';
import { useHistory } from 'react-router-dom';

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
    return roleMap[backendRole] || 'Reviewer';
};

interface ApprovalItem extends ContentVersion {
    contentTitle: string;
}

const ApprovalsPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
    const currentUser = getCurrentUser();
    const { canAccessPage } = usePermissions();
    const history = useHistory();

    const canApprove = canAccessPage('Approve');
    const canPublish = canAccessPage('Publish');

    const userRole = currentUser?.role ? mapBackendRoleToUserRole(currentUser.role) : 'Reviewer';

    const getStatusStyles = (state: string) => {
        switch (state.toLowerCase()) {
            case 'approved':
                return { bg: '#E8FFEA', color: '#00B42A', text: 'Approved' };
            case 'under_review':
                return { bg: '#FFF7E8', color: '#FF7D00', text: 'Under Review' };
            case 'published':
                return { bg: '#E8F3FF', color: '#4E7DD9', text: 'Published' };
            default:
                return { bg: '#F2F3F5', color: '#86909C', text: state };
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all content first
            const allContent = await services.content.getAllContent();
            const pendingItems: ApprovalItem[] = [];

            // For each content, check versions
            for (const content of allContent) {
                if (!content._id) continue;

                try {
                    const versions = await services.content.getContentVersions(content._id);
                    // Find versions that are under review or approved
                    const interestingVersions = versions.filter(v =>
                        v.state === 'under_review' || v.state === 'approved'
                    );

                    interestingVersions.forEach(v => {
                        pendingItems.push({
                            ...v,
                            contentTitle: content.title
                        });
                    });
                } catch (error) {
                    console.error(`Error fetching versions for content ${content._id}:`, error);
                }
            }

            // Sort by updated time (newest first)
            pendingItems.sort((a, b) => {
                const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
                const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
                return dateB - dateA;
            });

            setApprovals(pendingItems);
        } catch (error) {
            console.error('Error fetching approvals data:', error);
            Message.error('Failed to fetch approvals data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = (item: ApprovalItem) => {
        if (!currentUser) return;

        Modal.confirm({
            title: 'Approve Content',
            content: `Are you sure you want to approve "${item.contentTitle}" (Version ${item.version_number})?`,
            onOk: async () => {
                const res = await services.content.approveVersion(item._id!, currentUser.id);
                if (res.success) {
                    Message.success('Magazine approved successfully!');
                    fetchData();
                } else {
                    Message.error(res.message);
                }
            }
        });
    };

    const handlePublish = (item: ApprovalItem) => {
        Modal.confirm({
            title: 'Publish Content',
            content: `Are you sure you want to publish "${item.contentTitle}" (Version ${item.version_number})? It will become the live version.`,
            onOk: async () => {
                const res = await services.content.publishVersion(item._id!, item.content_id);
                if (res.success) {
                    Message.success('Magazine published successfully!');
                    fetchData();
                } else {
                    Message.error(res.message);
                }
            }
        });
    };

    const columns = [
        {
            title: 'Magazine Content',
            dataIndex: 'contentTitle',
            render: (text: string, record: ApprovalItem) => (
                <Space direction="vertical" size={2}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1D2129' }}>{text}</div>
                    <div style={{ fontSize: '12px', color: '#86909C' }}>
                        Version {record.version_number} • {new Date(record.updated_at || record.created_at || 0).toLocaleDateString()}
                    </div>
                </Space>
            )
        },
        {
            title: 'Current State',
            dataIndex: 'state',
            render: (state: string) => {
                const styles = getStatusStyles(state);
                return (
                    <Tag
                        style={{
                            background: styles.bg,
                            color: styles.color,
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                    >
                        {styles.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Actions',
            width: 320,
            render: (_: any, record: ApprovalItem) => (
                <Space>
                    <Button
                        icon={<IconEye />}
                        size="small"
                        type="secondary"
                        style={{ borderRadius: '6px' }}
                        onClick={() => history.push(`/preview?content_id=${record.content_id}&content_version_id=${record._id}&subject=${encodeURIComponent(record.contentTitle)}`)}
                    >
                        Review
                    </Button>

                    {record.state === 'under_review' && canApprove && (
                        <Button
                            type="primary"
                            status="success"
                            size="small"
                            icon={<IconCheck />}
                            style={{ borderRadius: '6px', background: '#00B42A', border: 'none' }}
                            onClick={() => handleApprove(record)}
                        >
                            Approve
                        </Button>
                    )}

                    {record.state === 'approved' && canPublish && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<IconPublic />}
                            style={{ borderRadius: '6px', background: '#4E7DD9', border: 'none' }}
                            onClick={() => handlePublish(record)}
                        >
                            Publish
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    if (!currentUser) return null;

    return (
        <DashboardLayout
            role={userRole}
            userName={currentUser.name}
            userAvatar={currentUser.avatar}
        >
            <div style={{ padding: '0px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Content Approvals</h2>
                    <Button
                        type="primary"
                        size="small"
                        onClick={fetchData}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>
                <div style={{
                    background: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #F2F3F5'
                }}>
                    {loading && approvals.length === 0 ? (
                        <div style={{ padding: '24px' }}>
                            <Skeleton animation text={{ rows: 5 }} />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={approvals}
                            rowKey="_id"
                            border={false}
                            pagination={false}
                            noDataElement={
                                <div style={{ padding: '120px 0', textAlign: 'center' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                                    <div style={{ color: '#1D2129', fontSize: '18px', fontWeight: 600 }}>Queue Clear</div>
                                    <div style={{ color: '#86909C' }}>No content currently awaiting approval.</div>
                                </div>
                            }
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default withPermission(ApprovalsPage, 'Approvals');
