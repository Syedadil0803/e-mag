
import React, { useState } from 'react';
import { Tabs, Button, Select } from '@arco-design/web-react';
import { IconSearch, IconMoreVertical, IconPlus } from '@arco-design/web-react/icon';
import styles from '../components/Components.module.scss';
import { useHistory } from 'react-router-dom';

const TabPane = Tabs.TabPane;

const EditorDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('1');
    const history = useHistory();

    const handleNewContent = () => {
        history.push('/create-magazine');
    };

    const dummyArticles = [
        { id: 1, title: '2025 Alumni Magazine', year: '2024-25', dept: 'Admin', status: 'Draft', date: '12 Aug' },
        { id: 2, title: 'Science Weekly', year: '2025', dept: 'CSE', status: 'Draft', date: '10 Aug' },
        { id: 3, title: 'Research Digest', year: '2024', dept: 'Science', status: 'Draft', date: '2 Aug' },
        { id: 4, title: 'Engineering Digest', year: '2025', dept: 'Commerce', status: 'Draft', date: '25 Jul' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Drafts</h2>
                <Button
                    type="secondary"
                    icon={<IconPlus />}
                    style={{
                        borderRadius: 8,
                        height: 40,
                        padding: '0 20px',
                        fontWeight: 600,
                        border: '1px solid #d9d9d9',
                        color: '#4e5969'
                    }}
                    onClick={handleNewContent}
                >
                    New Content
                </Button>
            </div>

            <Tabs
                activeTab={activeTab}
                onChange={setActiveTab}
                size="large"
                className={styles.customTabs}
            >
                <TabPane key="1" title="Draft" />
                <TabPane key="2" title="Under Review" />
                <TabPane key="3" title="Approved" />
                <TabPane key="4" title="Published" />
                <TabPane key="5" title="Archived" />
            </Tabs>

            <div className={styles.contentGrid}>
                {dummyArticles.map((article) => (
                    <div key={article.id} className={styles.articleCard}>
                        <div className={styles.articleCover}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
