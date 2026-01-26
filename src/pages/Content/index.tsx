import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import DashboardLayout from '../Dashboard/Layout';
import { getCurrentUser } from '@demo/services/auth';
import {
    Button,
    Table,
    Modal,
    Input,
    Message,
    Tag,
    Space,
    Spin
} from '@arco-design/web-react';
import {
    IconPlus,
    IconEdit,
    IconEye
} from '@arco-design/web-react/icon';
import { UserRole } from '../Dashboard/types';
import { usePermissions } from '../../hooks/usePermissions';
import {
    getAllContent,
    createContent,
    getContentVersions,
    Content,
    ContentVersion
} from '@demo/services/content';

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

    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [newContentTitle, setNewContentTitle] = useState('');
    const [newAcademicYear, setNewAcademicYear] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [creating, setCreating] = useState(false);
    const [userMap, setUserMap] = useState<Record<string, any>>({});
    const [contentVersions, setContentVersions] = useState<Record<string, ContentVersion>>({});

    // Check if user can create new content
    const canCreateContent = canPerformAction('NewContent', 'View');

    // Load all content on mount
    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        try {
            const data = await getAllContent();
            setContents(data);

            // Fetch user details for all unique user IDs
            const userIds = [...new Set(data.map(c => c.created_by).filter(Boolean))];
            await fetchUserDetails(userIds as string[]);

            // Fetch latest version for each content to get state
            const versionMap: Record<string, ContentVersion> = {};
            for (const content of data) {
                if (content._id) {
                    try {
                        const versions = await getContentVersions(content._id);
                        if (versions && versions.length > 0) {
                            // Get the latest or live version
                            const liveVersion = versions.find(v => v.is_live);
                            versionMap[content._id] = liveVersion || versions[versions.length - 1];
                        }
                    } catch (error) {
                        console.error(`Error loading versions for content ${content._id}:`, error);
                    }
                }
            }
            setContentVersions(versionMap);
        } catch (error) {
            Message.error('Failed to load content');
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userIds: string[]) => {
        try {
            // Import getUserById from rbac service
            const { getUserById } = await import('@demo/services/rbac');

            const userPromises = userIds.map(id => getUserById(id));
            const users = await Promise.all(userPromises);

            const newUserMap: Record<string, any> = {};
            users.forEach((user, index) => {
                if (user) {
                    newUserMap[userIds[index]] = user;
                }
            });

            setUserMap(newUserMap);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
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
                academic_year: newAcademicYear || undefined,
                department: newDepartment || undefined,
                created_by: currentUser?.id
            });

            if (result.success) {
                Message.success('Content created successfully!');
                setCreateModalVisible(false);
                setNewContentTitle('');
                setNewAcademicYear('');
                setNewDepartment('');

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

    const handleViewContent = async (contentId: string) => {
        try {
            // Get the content versions for this content
            const versions = await getContentVersions(contentId);

            if (versions && versions.length > 0) {
                // Get the latest version (or live version if exists)
                const liveVersion = versions.find(v => v.is_live);
                const latestVersion = liveVersion || versions[versions.length - 1];

                // Get the content details for the title
                const content = contents.find(c => c._id === contentId);
                const title = content?.title || 'Untitled';

                // Navigate to preview (read-only flipbook view)
                history.push(`/preview?content_id=${contentId}&content_version_id=${latestVersion._id}&subject=${encodeURIComponent(title)}`);
            } else {
                Message.warning('No published version available to preview');
            }
        } catch (error) {
            console.error('Error loading content:', error);
            Message.error('Failed to load content');
        }
    };

    const handleEditContent = async (contentId: string) => {
        try {
            // Get the content versions for this content
            const versions = await getContentVersions(contentId);

            if (versions && versions.length > 0) {
                // Get the latest version (or live version if exists)
                const liveVersion = versions.find(v => v.is_live);
                const latestVersion = liveVersion || versions[versions.length - 1];

                // Get the content details for the title
                const content = contents.find(c => c._id === contentId);
                const title = content?.title || 'Untitled';

                // Navigate to editor with content_version_id
                history.push(`/editor?content_id=${contentId}&content_version_id=${latestVersion._id}&subject=${encodeURIComponent(title)}`);
            } else {
                // No versions yet, redirect to template selection
                const content = contents.find(c => c._id === contentId);
                const title = content?.title || 'Untitled';
                history.push(`/create-magazine?content_id=${contentId}&title=${encodeURIComponent(title)}`);
            }
        } catch (error) {
            console.error('Error loading content:', error);
            Message.error('Failed to load content');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title: string) => (
                <span style={{ fontWeight: 500 }}>{title}</span>
            )
        },
        {
            title: 'Academic Year',
            dataIndex: 'academic_year',
            key: 'academic_year',
            render: (year: string) => year || '-'
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (dept: string) => dept || '-'
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (created_by: string) => {
                if (!created_by) return 'Unknown';

                const user = userMap[created_by];
                if (user) {
                    return user.name || user.username || user.email || 'User';
                }

                // Fallback: show current user's name if they created it
                if (created_by === currentUser?.id) {
                    return currentUser?.name || currentUser?.email || 'You';
                }

                return 'Loading...';
            }
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (_: any, record: Content) => {
                const version = contentVersions[record._id!];
                if (!version) {
                    return <Tag color="#86909c">No Version</Tag>;
                }

                const stateConfig: Record<string, { color: string; text: string }> = {
                    draft: { color: '#86909c', text: 'Draft' },
                    under_review: { color: '#ff7d00', text: 'Under Review' },
                    approved: { color: '#00b42a', text: 'Approved' },
                    published: { color: '#165dff', text: 'Published' },
                    archived: { color: '#4e5969', text: 'Archived' }
                };

                const config = stateConfig[version.state] || stateConfig.draft;
                return (
                    <Tag color={config.color}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Content) => (
                <Space>
                    <Button
                        type="text"
                        size="small"
                        icon={<IconEye />}
                        onClick={() => handleViewContent(record._id!)}
                    >
                        View
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<IconEdit />}
                        onClick={() => handleEditContent(record._id!)}
                    >
                        Edit
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <DashboardLayout
            role={userRole}
            userName={currentUser?.name || 'User'}
            userAvatar={currentUser?.avatar}
        >
            <div style={{ padding: '0px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingTop: '24px'
                }}>
                    {canCreateContent && (
                        <Button
                            type="primary"
                            icon={<IconPlus />}
                            onClick={() => setCreateModalVisible(true)}
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
                    overflow: 'hidden',
                    border: '1px solid #F2F3F5'
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Spin size={40} />
                            <p style={{ marginTop: '16px', color: '#86909c' }}>Loading content...</p>
                        </div>
                    ) : contents.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 0',
                            color: '#86909c'
                        }}>
                            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                                No content yet
                            </p>
                            <p style={{ fontSize: '14px' }}>
                                Create your first magazine to get started
                            </p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={contents}
                            rowKey="_id"
                            border={false}
                            pagination={false}
                        />
                    )}
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
                    setNewAcademicYear('');
                    setNewDepartment('');
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
                        Content Title *
                    </label>
                    <Input
                        placeholder="Enter magazine title"
                        value={newContentTitle}
                        onChange={setNewContentTitle}
                        onPressEnter={handleCreateContent}
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500
                    }}>
                        Academic Year
                    </label>
                    <Input
                        placeholder="e.g., 2025-2026"
                        value={newAcademicYear}
                        onChange={setNewAcademicYear}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 500
                    }}>
                        Department
                    </label>
                    <Input
                        placeholder="e.g., Computer Science"
                        value={newDepartment}
                        onChange={setNewDepartment}
                    />
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default ContentPage;
