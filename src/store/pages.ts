import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBlockData, BlockManager, BasicType } from 'easy-email-core';
import { v4 as uuidv4 } from 'uuid';

export type PageType = 'cover' | 'content' | 'back_cover';

export interface Page {
    id: string;
    name: string;
    content: IBlockData;
    order: number;
    type: PageType;
}

export interface PagesState {
    pages: Page[];
    currentPageIndex: number;
}

const createEmptyPage = (order: number, type: PageType = 'content', customName?: string): Page => {
    const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)?.create({
        attributes: {
            width: '1100px',
        },
    });

    if (pageBlock) {
        pageBlock.children = [];
    }

    let name = customName;
    if (!name) {
        if (type === 'cover') name = 'Front Cover';
        else if (type === 'back_cover') name = 'Back Cover';
        else name = `Page ${order}`; 
    }

    return {
        id: uuidv4(),
        name: name!,
        content: pageBlock as IBlockData,
        order,
        type,
    };
};

const reindexPages = (pages: Page[]) => {
    return pages.map((page, index) => {
        const updatedPage = { ...page, order: index };
        
        // Ensure type exists for legacy data
        if (!updatedPage.type) {
            if (index === 0) updatedPage.type = 'cover';
            else if (index === pages.length - 1 && pages.length > 1) updatedPage.type = 'back_cover';
            else updatedPage.type = 'content';
        }

        const pageNumber = index + 1;
        if (updatedPage.type === 'cover') {
            updatedPage.name = `Cover (${pageNumber})`;
        } else if (updatedPage.type === 'back_cover') {
            updatedPage.name = `Closing (${pageNumber})`;
        } else {
            updatedPage.name = `Page ${pageNumber}`;
        }
        return updatedPage;
    });
};

const initialState: PagesState = {
    pages: [
        createEmptyPage(0, 'cover'),
        createEmptyPage(1, 'content'),
        createEmptyPage(2, 'back_cover'),
    ],
    currentPageIndex: 0,
};

const pagesSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setPages: (state, action: PayloadAction<Page[]>) => {
            state.pages = reindexPages(action.payload);
        },
        setCurrentPageIndex: (state, action: PayloadAction<number>) => {
            state.currentPageIndex = action.payload;
        },
        addPage: (state) => {
            // Find the index of the back cover
            const backCoverIndex = state.pages.findIndex(p => p.type === 'back_cover');
            const insertIndex = backCoverIndex !== -1 ? backCoverIndex : state.pages.length;
            
            const newPage = createEmptyPage(insertIndex, 'content');
            state.pages.splice(insertIndex, 0, newPage);
            state.pages = reindexPages(state.pages);
            state.currentPageIndex = insertIndex;
        },
        deletePage: (state, action: PayloadAction<number>) => {
            const index = action.payload;
            const pageToDelete = state.pages[index];
            
            // Don't delete covers if we want to keep the structure
            if (pageToDelete.type === 'cover' || pageToDelete.type === 'back_cover') {
                return;
            }

            state.pages.splice(index, 1);
            state.pages = reindexPages(state.pages);
            
            // Adjust current index if needed
            if (state.currentPageIndex >= state.pages.length) {
                state.currentPageIndex = state.pages.length - 1;
            }
        },
        updateCurrentPageContent: (state, action: PayloadAction<IBlockData>) => {
            if (state.pages[state.currentPageIndex]) {
                state.pages[state.currentPageIndex].content = action.payload;
            }
        },
        updatePageName: (state, action: PayloadAction<{ index: number; name: string }>) => {
            if (state.pages[action.payload.index]) {
                state.pages[action.payload.index].name = action.payload.name;
            }
        },
        initializeFromTemplate: (state, action: PayloadAction<{ content: IBlockData; pages?: Page[] }>) => {
            if (action.payload.pages && action.payload.pages.length > 0) {
                // Multi-page template
                state.pages = reindexPages(action.payload.pages);
                state.currentPageIndex = 0;
            } else {
                // Single page template (backward compatibility)
                state.pages = reindexPages([
                    createEmptyPage(0, 'cover'),
                    {
                        id: uuidv4(),
                        name: 'Page 1',
                        content: action.payload.content,
                        order: 1,
                        type: 'content'
                    },
                    createEmptyPage(2, 'back_cover')
                ]);
                state.currentPageIndex = 1;
            }
        },
        resetPages: (state) => {
            state.pages = reindexPages([
                createEmptyPage(0, 'cover'),
                createEmptyPage(1, 'content'),
                createEmptyPage(2, 'back_cover'),
            ]);
            state.currentPageIndex = 0;
        },
    },
});

export const {
    setPages,
    setCurrentPageIndex,
    addPage,
    deletePage,
    updateCurrentPageContent,
    updatePageName,
    initializeFromTemplate,
    resetPages,
} = pagesSlice.actions;

export default pagesSlice.reducer;
