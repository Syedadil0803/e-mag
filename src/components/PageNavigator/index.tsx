import React, { useState } from 'react';
import { Modal, Message } from '@arco-design/web-react';
import { IconPlus, IconClose } from '@arco-design/web-react/icon';
import { Page } from '@demo/store/pages';
import './styles.scss';

interface PageNavigatorProps {
    pages: Page[];
    currentPageIndex: number;
    onPageSelect: (index: number) => void;
    onAddPage: () => void;
    onDeletePage: (index: number) => void;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
    pages,
    currentPageIndex,
    onPageSelect,
    onAddPage,
    onDeletePage,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();

        if (pages.length <= 1) {
            Message.warning('Cannot delete the last page');
            return;
        }

        Modal.confirm({
            title: 'Delete Page',
            content: `Are you sure you want to delete ${pages[index].name}?`,
            okText: 'Delete',
            cancelText: 'Cancel',
            onOk: () => {
                onDeletePage(index);
                Message.success('Page deleted successfully');
            },
        });
    };

    const contentPages = pages.filter(p => p.type !== 'back_cover');
    const closingPage = pages.find(p => p.type === 'back_cover');
    const closingPageIndex = pages.findIndex(p => p.type === 'back_cover');

    return (
        <div className="page-navigator">
            <div className="page-navigator-scroll">
                {contentPages.map((page, index) => (
                    <div
                        key={page.id}
                        className={`page-tab ${index === currentPageIndex ? 'active' : ''} ${page.type !== 'content' ? 'special-page' : ''}`}
                        onClick={() => onPageSelect(index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="page-tab-name">
                            {page.type === 'cover' ? `Cover (1)` : index + 1}
                        </span>
                        {page.type === 'content' && (
                            <button
                                className="page-tab-delete"
                                onClick={(e) => handleDeleteClick(e, index)}
                                aria-label="Delete page"
                            >
                                <IconClose />
                            </button>
                        )}
                    </div>
                ))}

                <button className="add-page-btn" onClick={onAddPage} aria-label="Add new page">
                    <IconPlus />
                </button>

                {closingPage && (
                    <div
                        key={closingPage.id}
                        className={`page-tab special-page ${closingPageIndex === currentPageIndex ? 'active' : ''}`}
                        onClick={() => onPageSelect(closingPageIndex)}
                        onMouseEnter={() => setHoveredIndex(closingPageIndex)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="page-tab-name">Closing ({closingPageIndex + 1})</span>
                    </div>
                )}
            </div>
        </div>
    );
};
