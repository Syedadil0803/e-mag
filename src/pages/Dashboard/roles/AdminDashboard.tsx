import React, { useState, useEffect } from 'react';
import { Tag, Select, Spin } from '@arco-design/web-react';
import { IconRight } from '@arco-design/web-react/icon';
import { getAllContent, getContentVersions } from '@demo/services/content';
import { useHistory } from 'react-router-dom';
import styles from '../components/Components.module.scss';

interface ContentWithVersion {
    _id?: string;
    title: string;
    department?: string;
    academic_year?: string;
    updated_at?: Date;
    version?: {
        _id?: string;
        version_number: string;
        state: string;
        is_live: boolean;
    } | null;
}

const AdminDashboard: React.FC = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [contents, setContents] = useState<ContentWithVersion[]>([]);
    const [stats, setStats] = useState([
        { title: 'Drafts', count: 0, color: '#4E7DD9' },
        { title: 'Under Review', count: 0, color: '#FF7D00' },
        { title: 'Approved', count: 0, color: '#14C9C9' },
        { title: 'Published', count: 0, color: '#4E7DD9' },
    ]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const allContent = await getAllContent();
            const contentsWithVersions: ContentWithVersion[] = [];

            for (const content of allContent) {
                if (!content._id) continue; // Skip content without _id
                
                try {
                    const versions = await getContentVersions(content._id);
                    const latestVersion = versions.length > 0 ? versions[0] : null;
                    
                    contentsWithVersions.push({
                        ...content,
                        version: latestVersion
                    });
                } catch (error) {
                    contentsWithVersions.push({
                        ...content,
                        version: null
                    });
                }
            }
            
            let draftCount = 0;
            let underReviewCount = 0;
            let approvedCount = 0;
            let publishedCount = 0;

            contentsWithVersions.forEach((content: ContentWithVersion) => {
                if (content.version) {
                    switch (content.version.state) {
                        case 'draft':
                            draftCount++;
                            break;
                        case 'under_review':
                            underReviewCount++;
                            break;
                        case 'approved':
                            approvedCount++;
                            break;
                        case 'published':
                            publishedCount++;
                            break;
                    }
                }
            });

            setContents(contentsWithVersions);
            setStats([
                { title: 'Drafts', count: draftCount, color: '#4E7DD9' },
                { title: 'Under Review', count: underReviewCount, color: '#FF7D00' },
                { title: 'Approved', count: approvedCount, color: '#14C9C9' },
                { title: 'Published', count: publishedCount, color: '#4E7DD9' },
            ]);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleContentClick = (content: ContentWithVersion) => {
        if (content._id && content.version) {
            history.push(`/editor?content_id=${content._id}&content_version_id=${content.version._id}&subject=${encodeURIComponent(content.title)}`);
        } else if (content._id) {
            history.push(`/create-magazine?content_id=${content._id}&title=${encodeURIComponent(content.title)}`);
        }
    };

    const formatTimeAgo = (date?: Date) => {
        if (!date) return 'Unknown';
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    const getStateLabel = (state?: string) => {
        if (!state) return 'No Version';
        const stateMap: Record<string, string> = {
            draft: 'Draft',
            under_review: 'Under Review',
            approved: 'Approved',
            published: 'Published',
            archived: 'Archived'
        };
        return stateMap[state] || state;
    };

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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Spin size={40} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1d2129' }}>Admin Dashboard</h2>
            </div>

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
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
                <div className={styles.reviewerSection}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 16, color: '#1d2129' }}>Recent Content</h3>
                    <div className={styles.reviewerTable}>
                        {contents.length > 0 ? (
                            contents.slice(0, 5).map((content, index) => (
                                <div
                                    key={content._id || index}
                                    className={styles.reviewerTableRow}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleContentClick(content)}
                                >
                                    <div style={{ flex: '1' }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                            {content.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#86909c' }}>
                                            {content.department || 'General'} • {content.academic_year || 'N/A'}
                                        </div>
                                    </div>
                                    <div style={{ flex: '0 0 140px' }}>
                                        <Tag
                                            style={{
                                                background: getStatusColor(getStateLabel(content.version?.state)).bg,
                                                color: getStatusColor(getStateLabel(content.version?.state)).color,
                                                border: 'none',
                                                borderRadius: 4,
                                                padding: '4px 12px',
                                                fontSize: 12,
                                                fontWeight: 600
                                            }}
                                        >
                                            {getStateLabel(content.version?.state)}
                                        </Tag>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#86909c' }}>
                                No content yet. Create your first magazine to get started!
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.reviewerSection}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 16, color: '#1d2129' }}>
                        Pending Approvals
                    </h3>
                    <div className={styles.reviewerTable}>
                        {contents.filter(c => c.version?.state === 'under_review').length > 0 ? (
                            contents
                                .filter(c => c.version?.state === 'under_review')
                                .slice(0, 4)
                                .map((content, index) => (
                                    <div
                                        key={content._id || index}
                                        className={styles.reviewerTableRow}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleContentClick(content)}
                                    >
                                        <div style={{ flex: '1' }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 4 }}>
                                                {content.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#86909c' }}>
                                                Updated {formatTimeAgo(content.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#86909c' }}>
                                No pending approvals
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;