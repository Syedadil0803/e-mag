import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Message, Button } from '@arco-design/web-react';
import { IconLeft } from '@arco-design/web-react/icon';
import { getEMagsByContentVersion } from '@demo/services/editor';
import { generateFlipBookHtml } from '@demo/pages/Home/components/FlipBookExport';
import { Loading } from '@demo/components/loading';

const PreviewPage: React.FC = () => {
    const history = useHistory();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    const params = new URLSearchParams(location.search);
    const contentVersionId = params.get('content_version_id');
    const subject = params.get('subject');

    useEffect(() => {
        const loadPreview = async () => {
            if (!contentVersionId) {
                Message.error('No content version specified');
                history.goBack();
                return;
            }

            try {
                setLoading(true);
                const emags = await getEMagsByContentVersion(contentVersionId);

                if (emags && emags.length > 0) {
                    const eMag = emags[0];
                    const savedData = JSON.parse(eMag.htmlData);

                    if (savedData.pages && savedData.pages.length > 0) {
                        // Generate flipbook HTML using the same function as editor
                        const flipbookHtml = generateFlipBookHtml({
                            pages: savedData.pages,
                            currentPageIndex: 0,
                            currentValues: {
                                subject: subject || 'Magazine',
                                subTitle: '',
                                content: savedData.pages[0].content
                            },
                            templateSubject: subject || 'Magazine',
                            mergeTags: {}
                        });

                        // Open in new window (same as editor's View button)
                        const win = window.open('', '_blank');
                        if (win) {
                            win.document.write(flipbookHtml);
                            win.document.close();
                            // Go back after opening preview
                            history.goBack();
                        } else {
                            Message.error('Please allow popups to view the magazine');
                            history.goBack();
                        }
                    } else {
                        Message.error('No pages found in magazine');
                        history.goBack();
                    }
                } else {
                    Message.error('No magazine data found');
                    history.goBack();
                }
            } catch (error) {
                console.error('Error loading preview:', error);
                Message.error('Failed to load preview');
                history.goBack();
            } finally {
                setLoading(false);
            }
        };

        loadPreview();
    }, [contentVersionId, subject, history]);

    return (
        <Loading loading={loading}>
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loader" style={{
                        fontSize: '48px',
                        color: '#1890ff',
                        marginBottom: '20px'
                    }}>
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <p style={{ fontSize: '18px', color: '#666' }}>
                        Opening preview...
                    </p>
                </div>
            </div>
        </Loading>
    );
};

export default PreviewPage;
