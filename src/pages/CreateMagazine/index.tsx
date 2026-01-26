import React, { useState, useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import { IconLeft, IconPlus } from '@arco-design/web-react/icon';
import { useHistory, useLocation } from 'react-router-dom';
import { createContentVersion } from '@demo/services/content';
import { getCurrentUser } from '@demo/services/auth';
import './styles.css';

const CreateMagazine = () => {
    const history = useHistory();
    const location = useLocation();
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
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
        </div>
    );
};

export default CreateMagazine;
