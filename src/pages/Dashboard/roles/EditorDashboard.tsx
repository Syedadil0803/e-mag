
import React, { useState, useMemo } from 'react';
import { Tabs, Button, Select } from '@arco-design/web-react';
import { IconSearch, IconMoreVertical, IconPlus } from '@arco-design/web-react/icon';
import styles from '../components/Components.module.scss';
import { useHistory } from 'react-router-dom';
import { usePermissions } from '../../../hooks/usePermissions';

const TabPane = Tabs.TabPane;

const EditorDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('1');
    const history = useHistory();
    const { canAccessTab, isAdmin, canPerformAction, permissions } = usePermissions();

    const handleNewContent = () => {
        history.push('/create-magazine');
    };

    const dummyArticles = [
        { id: 1, title: '2025 Alumni Magazine', year: '2024-25', dept: 'Admin', status: 'Draft', date: '12 Aug' },
        { id: 2, title: 'Science Weekly', year: '2025', dept: 'CSE', status: 'Draft', date: '10 Aug' },
        { id: 3, title: 'Research Digest', year: '2024', dept: 'Science', status: 'Draft', date: '2 Aug' },
        { id: 4, title: 'Engineering Digest', year: '2025', dept: 'Commerce', status: 'Draft', date: '25 Jul' },
    ];

    // All possible dashboard tabs
    const allTabs = [
        { key: '1', title: 'Draft', requiredTab: 'Draft' },
        { key: '2', title: 'Under Review', requiredTab: 'UnderReview' },
        { key: '3', title: 'Approved', requiredTab: 'Approved' },
        { key: '4', title: 'Published', requiredTab: 'Published' },
        { key: '5', title: 'Archived', requiredTab: 'Archived' },
    ];

    // Filter tabs based on permissions
    const visibleTabs = useMemo(() => {
        // Filter based on Dashboard tab permissions - No bypass!
        return allTabs.filter(tab => canAccessTab('Dashboard', tab.requiredTab));
    }, [canAccessTab]);

    // Check if user can create content
    const canCreateContent = canPerformAction('NewContent', 'View');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                    <Tabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        size="large"
                        className={styles.customTabs}
                    >
                        {visibleTabs.map(tab => (
                            <TabPane key={tab.key} title={tab.title} />
                        ))}
                    </Tabs>
                </div>
                {canCreateContent && (
                    <Button
                        type="primary"
                        icon={<IconPlus />}
                        style={{
                            borderRadius: 8,
                            height: 38,
                            padding: '0 20px',
                            fontWeight: 600,
                            background: '#4E7DD9',
                            border: 'none',
                            marginLeft: 16
                        }}
                        onClick={handleNewContent}
                    >
                        New Content
                    </Button>
                )}
            </div>

            <div className={styles.contentGrid}>
                {dummyArticles.map((article) => (
                    <div key={article.id} className={styles.articleCard}>
                        <div className={styles.articleCover}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 20
                            }}>
                                <div style={{ background: '#2D5A9E', color: 'white', padding: '4px 8px', width: 'fit-content', borderRadius: 4, fontSize: 10, marginBottom: 10 }}>Cover</div>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#2D5A9E' }}>{article.title}</div>
                            </div>
                            <div className={styles.statusBadge} style={{ color: '#2D5A9E' }}>{article.status}</div>
                        </div>
                        <div className={styles.articleInfo}>
                            <div className={styles.articleTitle}>{article.title}</div>
                            <div className={styles.articleMeta}>
                                <span>Academic Year: {article.year}</span>
                                <span>Departments: {article.dept}</span>
                                <span>Status: {article.date}</span>
                            </div>
                        </div>
                        <div className={styles.articleFooter}>
                            <span style={{ fontSize: 12, color: '#86909c' }}>Draft</span>
                            <Button type="outline" size="small" style={{ borderRadius: 6 }}>OPEN</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditorDashboard;
