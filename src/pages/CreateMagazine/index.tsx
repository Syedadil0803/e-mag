import React, { useState, useEffect } from 'react';
import { Message, Modal } from '@arco-design/web-react';
import { IconLeft, IconPlus, IconEye } from '@arco-design/web-react/icon';
import { useHistory, useLocation } from 'react-router-dom';
import { createContentVersion } from '@demo/services/content';
import { getCurrentUser } from '@demo/services/auth';
import { universityChronicleData, campusReviewData } from '@demo/services/mockTemplates';
import './styles.css';

// Helper component for scaled page preview
const PagePreview = ({ page, nativeWidth = 1240, nativeHeight = 1754 }: { page: any, nativeWidth?: number, nativeHeight?: number }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;
        if (!container || !content) return;

        const updateScale = () => {
            const parentWidth = container.clientWidth;
            const scale = parentWidth / nativeWidth;
            content.style.transform = `scale(${scale})`;
        };

        // Initial scale
        updateScale();

        // Observer for resizing
        const observer = new ResizeObserver(updateScale);
        observer.observe(container);

        return () => observer.disconnect();
    }, [nativeWidth]);

    return (
        <div
            ref={containerRef}
            className="preview-scale-container"
            style={{
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                aspectRatio: `${nativeWidth}/${nativeHeight}`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#fff' // Ensure background is white/opaque
            }}
        >
            <div
                ref={contentRef}
                className="preview-scaler"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${nativeWidth}px`,
                    height: `${nativeHeight}px`,
                    backgroundColor: page.backgroundColor,
                    transformOrigin: '0 0',
                    willChange: 'transform' // Optimize performance
                }}
            >
                {/* Render images */}
                {page.elements
                    .filter((el: any) => el.type === 'image')
                    .map((element: any, idx: number) => (
                        <img
                            key={`${element.id}-${idx}`}
                            src={element.src}
                            alt={element.id}
                            style={{
                                position: 'absolute',
                                left: `${element.x}px`,
                                top: `${element.y}px`,
                                width: `${element.width}px`,
                                height: `${element.height}px`,
                                objectFit: 'cover',
                                zIndex: 1
                            }}
                        />
                    ))
                }

                {/* Render text */}
                {page.elements
                    .filter((el: any) => el.type === 'text')
                    .map((element: any, idx: number) => (
                        <div
                            key={`${element.id}-${idx}`}
                            style={{
                                position: 'absolute',
                                left: `${element.x}px`,
                                top: `${element.y}px`,
                                width: element.width ? `${element.width}px` : (element.x === 0 ? '100%' : 'auto'),
                                fontFamily: element.font?.family || 'inherit',
                                fontSize: `${element.font?.size}px`,
                                fontWeight: element.font?.weight || 400,
                                color: element.font?.color || '#000',
                                textAlign: element.font?.align as any || 'left',
                                letterSpacing: element.font?.letterSpacing ? `${element.font.letterSpacing}px` : 'normal',
                                lineHeight: element.font?.lineHeight || 1.5,
                                fontStyle: element.font?.style || 'normal',
                                padding: element.x === 0 ? '0 20px' : '0',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                            dangerouslySetInnerHTML={{ __html: element.content }}
                        />
                    ))
                }
            </div>
        </div>
    );
};

const CreateMagazine = () => {
    const history = useHistory();
    const location = useLocation();
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<number | null>(null);
    const currentUser = getCurrentUser();

    // Get content_id and title from URL params
    const params = new URLSearchParams(location.search);
    const contentId = params.get('content_id');
    const titleFromUrl = params.get('title');

    // Validate that we have required params
    useEffect(() => {
        if (!contentId || !titleFromUrl) {
            Message.error('Missing content information. Please create content first.');
            history.push('/content');
        }
    }, [contentId, titleFromUrl, history]);

    // Enhanced templates data with gradients/colors
    const templates = [
        {
            id: 1,
            name: 'University Chronicle',
            description: 'Classic collegiate newspaper style.',
            bg: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
            textColor: '#2c3e50',
            accent: '#8B2E2E'
        },
        {
            id: 2,
            name: 'The Campus Review',
            description: 'Modern editorial with bold typography.',
            bg: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
            textColor: '#000',
            accent: '#F05A28'
        },
    ];

    const handleTemplateSelect = async (templateId: number) => {
        if (!contentId) {
            Message.error('Content ID is missing');
            return;
        }

        setCreating(true);
        try {
            // Create a new content version
            const versionResult = await createContentVersion(contentId, {
                version_number: '1.0',
                state: 'draft',
                is_live: false,
                created_by: currentUser?.id
            });

            if (versionResult.success) {
                const contentVersionId = versionResult.data._id;

                // Navigate to editor with template, content_id, and content_version_id
                const magazineName = titleFromUrl ? decodeURIComponent(titleFromUrl) : 'Untitled';
                let query = templateId === 0
                    ? `?subject=${encodeURIComponent(magazineName)}`
                    : `?template_id=${templateId}&subject=${encodeURIComponent(magazineName)}`;

                query += `&content_id=${contentId}&content_version_id=${contentVersionId}`;

                history.push(`/editor${query}`);
            } else {
                Message.error(versionResult.message || 'Failed to create version');
                setCreating(false);
            }
        } catch (error) {
            Message.error('Failed to create content version');
            console.error('Error creating version:', error);
            setCreating(false);
        }
    };

    const goBack = () => {
        history.goBack();
    };

    return (
        <div className="create-magazine-container">
            <button className="back-button" onClick={goBack} disabled={creating}>
                <IconLeft style={{ fontSize: 20 }} />
            </button>

            <div className="header-section fade-in">
                <h1 className="page-title">
                    Choose Your Template
                </h1>
                <p className="page-subtitle">
                    Select a template to get started with "{titleFromUrl ? decodeURIComponent(titleFromUrl) : 'your magazine'}"
                </p>
            </div>

            <div className="template-grid fade-in" style={{ animationDelay: '0.1s' }}>
                {/* Blank Option */}
                <div
                    className={`template-card ${selectedTemplate === 0 ? 'selected' : ''} ${creating ? 'disabled' : ''}`}
                    onClick={() => !creating && handleTemplateSelect(0)}
                >
                    <div className="card-cover blank-cover">
                        <div className="cover-content">
                            <div className="plus-icon">
                                <IconPlus />
                            </div>
                            <div className="template-preview-text" style={{ fontSize: 20, color: '#666' }}> Blank Canvas</div>
                        </div>
                    </div>
                    <div className="card-info">
                        <div className="card-title">Start from Scratch</div>
                        <div className="card-desc">Build your design from the ground up, exactly how you envision it.</div>
                    </div>
                </div>

                {templates.map(t => (
                    <div
                        key={t.id}
                        className={`template-card ${selectedTemplate === t.id ? 'selected' : ''} ${creating ? 'disabled' : ''}`}
                        onClick={() => !creating && handleTemplateSelect(t.id)}
                    >
                        <div className="card-cover" style={{ background: t.bg }}>
                            <div className="cover-content" style={{ color: t.textColor }}>
                                <div className="template-preview-text">{t.name}</div>
                            </div>
                            <button
                                className="preview-icon-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewTemplate(t.id);
                                }}
                                disabled={creating}
                            >
                                <IconEye />
                            </button>
                        </div>
                        <div className="card-info">
                            <div className="card-title">{t.name}</div>
                            <div className="card-desc">{t.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            {creating && (
                <div className="creating-overlay">
                    <div className="creating-message">
                        <div className="spinner"></div>
                        <p>Creating your magazine...</p>
                    </div>
                </div>
            )}

            <Modal
                visible={previewTemplate !== null}
                onCancel={() => setPreviewTemplate(null)}
                footer={null}
                style={{ width: '60vw', maxWidth: '800px' }}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>{previewTemplate !== null ? templates.find(t => t.id === previewTemplate)?.name : ''}</span>
                        <span style={{ fontSize: '14px', color: '#888', fontWeight: 'normal' }}>
                            Template Preview - {previewTemplate !== null && (previewTemplate === 1 ? universityChronicleData : campusReviewData).document.pages.length} Pages
                        </span>
                    </div>
                }
            >
                {previewTemplate !== null && (() => {
                    const templateData = previewTemplate === 1 ? universityChronicleData : campusReviewData;

                    return (
                        <div className="template-preview-modal">
                            <div className="preview-pages-container">
                                {templateData.document.pages.map((page: any, pageIndex: number) => {
                                    return (
                                        <div key={page.id} className="preview-page-wrapper">
                                            <div className="preview-page-label">
                                                Page {pageIndex + 1} of {templateData.document.pages.length}
                                            </div>
                                            <PagePreview page={page} />
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{
                                marginTop: '20px',
                                padding: '14px',
                                background: '#f5f7fa',
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '14px',
                                fontWeight: 500
                            }}>
                                📖 Showing all {templateData.document.pages.length} pages • Scroll to view • Click template card to start editing
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
};

export default CreateMagazine;
