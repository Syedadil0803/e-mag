import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBlockData, BlockManager, BasicType } from 'easy-email-core';
import { v4 as uuidv4 } from 'uuid';

export interface Page {
    id: string;
    name: string;
    content: IBlockData;
    order: number;
}

export interface PagesState {
    pages: Page[];
    currentPageIndex: number;
}

const createEmptyPage = (order: number): Page => {
    const pageBlock = BlockManager.getBlockByType(BasicType.PAGE)?.create({
        attributes: {
            width: '1100px',
        },
    });

    if (pageBlock) {
        pageBlock.children = [];
    }

    return {
        id: uuidv4(),
        name: `Page ${order + 1}`,
        content: pageBlock as IBlockData,
        order,
    };
};

const initialState: PagesState = {
    pages: [createEmptyPage(0)],
    currentPageIndex: 0,
};

const pagesSlice = createSlice({
    name: 'pages',
    initialState,
    reducers: {
        setPages: (state, action: PayloadAction<Page[]>) => {
            state.pages = action.payload;
        },
        setCurrentPageIndex: (state, action: PayloadAction<number>) => {
            state.currentPageIndex = action.payload;
        },
        addPage: (state) => {
            const newPage = createEmptyPage(state.pages.length);
            state.pages.push(newPage);
            state.currentPageIndex = state.pages.length - 1;
        },
        deletePage: (state, action: PayloadAction<number>) => {
            if (state.pages.length > 1) {
                state.pages.splice(action.payload, 1);
                // Update order for remaining pages
                state.pages.forEach((page, index) => {
                    page.order = index;
                    page.name = `Page ${index + 1}`;
                });
                // Adjust current index if needed
                if (state.currentPageIndex >= state.pages.length) {
                    state.currentPageIndex = state.pages.length - 1;
                }
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
                state.pages = action.payload.pages;
                state.currentPageIndex = 0;
            } else {
                // Single page template (backward compatibility)
                state.pages = [{
                    id: uuidv4(),
                    name: 'Page 1',
                    content: action.payload.content,
                    order: 0,
                }];
                state.currentPageIndex = 0;
            }
        },
        resetPages: (state) => {
            state.pages = [createEmptyPage(0)];
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
