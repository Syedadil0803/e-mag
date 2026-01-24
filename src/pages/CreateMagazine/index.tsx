import React, { useState } from 'react';
import { Button, Input, Message } from '@arco-design/web-react';
import { IconLeft, IconPlus } from '@arco-design/web-react/icon';
import { useHistory } from 'react-router-dom';
import './styles.css';

const CreateMagazine = () => {
    const history = useHistory();
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [magazineName, setMagazineName] = useState('');

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
        {
            id: 3,
            name: 'Creative Portfolio',
            description: 'Minimalist layout for creatives.',
            bg: 'linear-gradient(to right, #fa709a 0%, #fee140 100%)', // Vibrant gradient
            textColor: '#fff',
            accent: '#fff'
        },
    ];

    const handleTemplateSelect = (id: number) => {
        setSelectedTemplate(id);
        setStep(2);
    };

    const handleCreate = () => {
        if (!magazineName.trim()) {
            Message.error('Please enter a magazine name');
            return;
        }

        if (selectedTemplate !== null) {
            // If selectedTemplate is 0 (Blank), don't pass template_id so it uses default/empty content
            const query = selectedTemplate === 0
                ? `?subject=${encodeURIComponent(magazineName)}`
                : `?template_id=${selectedTemplate}&subject=${encodeURIComponent(magazineName)}`;
            history.push(`/editor${query}`);
        }
    };

    const goBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            history.goBack();
        }
    };

    return (
        <div className="create-magazine-container">
            <button className="back-button" onClick={goBack}>
                <IconLeft style={{ fontSize: 20 }} />
            </button>

            <div className="header-section fade-in">
                <h1 className="page-title">
                    {step === 1 ? 'Design Your Masterpiece' : 'Name Your Magazine'}
                </h1>
                <p className="page-subtitle">
                    {step === 1
                        ? 'Select a template to get started with your new publication.'
                        : 'Choose a memorable name that captures the essence of your work.'}
                </p>
            </div>

            {step === 1 && (
                <div className="template-grid fade-in" style={{ animationDelay: '0.1s' }}>
                    {/* Blank Option */}
                    <div
                        className={`template-card ${selectedTemplate === 0 ? 'selected' : ''}`}
                        onClick={() => handleTemplateSelect(0)}
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
                            className={`template-card ${selectedTemplate === t.id ? 'selected' : ''}`}
                            onClick={() => handleTemplateSelect(t.id)}
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
            )}

            {step === 2 && (
                <div className="naming-container fade-in" style={{ animationDelay: '0.1s' }}>

                    <label className="input-label">Publication Title</label>
                    <Input
                        className="magazine-title-input"
                        placeholder="e.g. The Morning Edition"
                        value={magazineName}
                        onChange={setMagazineName}
                        autoFocus
                        onPressEnter={handleCreate}
                    />

                    <div className="action-buttons">
                        <Button
                            className="btn-large btn-secondary"
                            onClick={() => setStep(1)}
                        >
                            Change Template
                        </Button>
                        <Button
                            type="primary"
                            className="btn-large btn-primary"
                            onClick={handleCreate}
                            disabled={!magazineName.trim()}
                        >
                            Start Editing
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateMagazine;
