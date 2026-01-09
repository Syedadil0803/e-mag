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

    return (
        <div className="page-navigator">
            <div className="page-navigator-scroll">
                {pages.map((page, index) => (
                    <div
                        key={page.id}
                        className={`page-tab ${index === currentPageIndex ? 'active' : ''}`}
                        onClick={() => onPageSelect(index)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="page-tab-name">{index + 1}</span>
                        {pages.length > 1 && (
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
            </div>
        </div>
    );
};
