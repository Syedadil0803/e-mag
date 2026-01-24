import { BasicType } from 'easy-email-core';
import { v4 as uuidv4 } from 'uuid';

export const universityChronicleData = {
    "document": {
        "id": "university-chronicle-magazine",
        "pageSize": { "width": 1240, "height": 1754, "unit": "px" },
        "pages": [
            {
                "id": "page-cover",
                "backgroundColor": "#FDFBF7",
                "elements": [
                    {
                        "id": "edition",
                        "type": "text",
                        "x": 0,
                        "y": 40,
                        "content": "AUTUMN 2025 | VOL. 84",
                        "font": {
                            "family": "Merriweather",
                            "size": 16,
                            "weight": 700,
                            "align": "center",
                            "color": "#8B2E2E",
                            "letterSpacing": 2
                        }
                    },
                    {
                        "id": "title",
                        "type": "text",
                        "x": 0,
                        "y": 80,
                        "content": "University Chronicle",
                        "font": {
                            "family": "Cinzel",
                            "size": 72,
                            "weight": 700,
                            "align": "center",
                            "color": "#1A1A1A"
                        }
                    },
                    {
                        "id": "subtitle",
                        "type": "text",
                        "x": 0,
                        "y": 160,
                        "content": "ESTABLISHED 1941",
                        "font": {
                            "family": "Lato",
                            "size": 12,
                            "weight": 400,
                            "align": "center",
                            "color": "#666"
                        }
                    },
                    {
                        "id": "cover-image",
                        "type": "image",
                        "x": 0,
                        "y": 200,
                        "width": 1240,
                        "height": 600,
                        "src": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "id": "feature-tag",
                        "type": "text",
                        "x": 100,
                        "y": 840,
                        "content": "FEATURE STORY",
                        "font": {
                            "family": "Lato",
                            "size": 14,
                            "weight": 700,
                            "color": "#8B2E2E",
                            "letterSpacing": 1
                        }
                    },
                    {
                        "id": "feature-title",
                        "type": "text",
                        "x": 100,
                        "y": 870,
                        "width": 800,
                        "content": "The Future of Tradition: \nKeeping Campus Heritage Alive",
                        "font": {
                            "family": "Merriweather",
                            "size": 42,
                            "weight": 700,
                            "color": "#1A1A1A",
                            "lineHeight": 1.2
                        }
                    },
                    {
                        "id": "feature-summary",
                        "type": "text",
                        "x": 100,
                        "y": 980,
                        "width": 600,
                        "content": "As we modernize our facilities, how do we preserve the historical essence that defines our alma mater? Features an interview with the Dean of Architecture.",
                        "font": {
                            "family": "Lato",
                            "size": 18,
                            "lineHeight": 1.6,
                            "color": "#444"
                        }
                    }
                ]
            },
            {
                "id": "page-article",
                "backgroundColor": "#FFFFFF",
                "elements": [
                    {
                        "id": "article-header-image",
                        "type": "image",
                        "x": 0,
                        "y": 0,
                        "width": 1240,
                        "height": 500,
                        "src": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "id": "article-title",
                        "type": "text",
                        "x": 100,
                        "y": 540,
                        "content": "Student Life Reimagined",
                        "font": {
                            "family": "Cinzel",
                            "size": 48,
                            "weight": 700,
                            "color": "#1A1A1A"
                        }
                    },
                    {
                        "id": "article-byline",
                        "type": "text",
                        "x": 100,
                        "y": 600,
                        "content": "By Sarah Jenkins, Class of '26",
                        "font": {
                            "family": "Lato",
                            "size": 14,
                            "style": "italic",
                            "color": "#666"
                        }
                    },
                    {
                        "id": "intro-text",
                        "type": "text",
                        "x": 100,
                        "y": 650,
                        "width": 1040,
                        "content": "The campus buzzes with a new energy this semester. Clubs are expanding, libraries are full, and the quad is once again the center of student life. But beneath the surface, a new culture of collaboration is emerging.",
                        "font": {
                            "family": "Merriweather",
                            "size": 20,
                            "weight": 300,
                            "lineHeight": 1.8,
                            "color": "#333"
                        }
                    },
                    {
                        "id": "body-text-1",
                        "type": "text",
                        "x": 100,
                        "y": 780,
                        "width": 1040,
                        "content": "Whatever the reason, the shift is palpable. 'I feel more connected to my peers than ever,' says mark, a sophomore majoring in History. This sentiment is echoed across departments, from the sciences to the arts.",
                        "font": {
                            "family": "Lato",
                            "size": 16,
                            "lineHeight": 1.7,
                            "color": "#444"
                        }
                    }
                ]
            },
            {
                "id": "page-closing",
                "backgroundColor": "#FDFBF7",
                "elements": [
                    {
                        "id": "closing-image",
                        "type": "image",
                        "x": 120,
                        "y": 150,
                        "width": 1000,
                        "height": 600,
                        "src": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "id": "contact-header",
                        "type": "text",
                        "x": 0,
                        "y": 800,
                        "content": "Join The Chronicle Team",
                        "font": {
                            "family": "Cinzel",
                            "size": 32,
                            "weight": 700,
                            "align": "center",
                            "color": "#1A1A1A"
                        }
                    },
                    {
                        "id": "contact-text",
                        "type": "text",
                        "x": 300,
                        "y": 860,
                        "width": 640,
                        "content": "We are looking for writers, photographers, and editors for the Spring semester. \nApply online or visit us in the Student Union, Room 304.",
                        "font": {
                            "family": "Lato",
                            "size": 16,
                            "align": "center",
                            "lineHeight": 1.6,
                            "color": "#555"
                        }
                    },
                    {
                        "id": "footer",
                        "type": "text",
                        "x": 0,
                        "y": 1000,
                        "content": "© 2025 University Chronicle. All rights reserved.",
                        "font": {
                            "family": "Lato",
                            "size": 12,
                            "align": "center",
                            "color": "#999"
                        }
                    }
                ]
            }
        ]
    }
};




export const campusReviewData = {
    "document": {
        "id": "editorial-magazine-with-images",
        "pageSize": { "width": 1240, "height": 1754, "unit": "px" },
        "pages": [
            {
                "id": "page-cover",
                "backgroundColor": "#FFFFFF",
                "elements": [
                    {
                        "id": "masthead-group",
                        "type": "text",
                        "x": 0,
                        "y": 0,
                        "content": "CAMPUS <span style='color:#F05A28'>REVIEW</span>",
                        "font": {
                            "family": "Oswald",
                            "size": 60,
                            "weight": 700,
                            "align": "left",
                            "color": "#000",
                            "letterSpacing": -1
                        }
                    },
                    {
                        "id": "date-line",
                        "type": "text",
                        "x": 0,
                        "y": 70,
                        "content": "ISSUE 42 • SEPTEMBER 2025 • STUDENT VOICE",
                        "font": {
                            "family": "Roboto",
                            "size": 12,
                            "weight": 500,
                            "align": "left",
                            "color": "#888",
                            "letterSpacing": 2
                        }
                    },
                    {
                        "id": "cover-main-image",
                        "type": "image",
                        "x": 0,
                        "y": 120,
                        "width": 1240,
                        "height": 700,
                        "src": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "id": "cover-headline-1",
                        "type": "text",
                        "x": 0,
                        "y": 850,
                        "content": "SILENT SPACES",
                        "font": {
                            "family": "Playfair Display",
                            "size": 72,
                            "weight": 700,
                            "align": "left",
                            "color": "#111"
                        }
                    },
                    {
                        "id": "cover-sub-1",
                        "type": "text",
                        "x": 0,
                        "y": 940,
                        "width": 600,
                        "content": "Why the campus library remains the heart of the university in a digital age.",
                        "font": {
                            "family": "Roboto",
                            "size": 20,
                            "lineHeight": 1.4,
                            "align": "left",
                            "color": "#444"
                        }
                    }
                ]
            },
            {
                "id": "page-article-2",
                "backgroundColor": "#f8f9fa",
                "elements": [
                    {
                        "id": "article-pic",
                        "type": "image",
                        "x": 0,
                        "y": 0,
                        "width": 1240,
                        "height": 550,
                        "src": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2049&auto=format&fit=crop"
                    },
                    {
                        "id": "art-title",
                        "type": "text",
                        "x": 0,
                        "y": 580,
                        "content": "The Digital Detox",
                        "font": {
                            "family": "Oswald",
                            "size": 48,
                            "weight": 500,
                            "color": "#000"
                        }
                    },
                    {
                        "id": "art-body",
                        "type": "text",
                        "x": 0,
                        "y": 660,
                        "width": 1240,
                        "content": "In a world of constant notifications, students are finding refuge in analog habits. Sales of physical notebooks are up, and 'laptop-free' study zones are packed.",
                        "font": {
                            "family": "Roboto",
                            "size": 18,
                            "lineHeight": 1.6,
                            "color": "#333"
                        }
                    }
                ]
            },
            {
                "id": "page-closing-2",
                "backgroundColor": "#111",
                "elements": [
                    {
                        "id": "end-img",
                        "type": "image",
                        "x": 0,
                        "y": 100,
                        "width": 1000,
                        "height": 600,
                        "src": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                    },
                    {
                        "id": "end-txt",
                        "type": "text",
                        "x": 0,
                        "y": 750,
                        "content": "NEXT MONTH: THE ART ISSUE",
                        "font": {
                            "family": "Oswald",
                            "size": 36,
                            "align": "center",
                            "color": "#FFF",
                            "letterSpacing": 4
                        }
                    }
                ]
            }
        ]
    }
};

const mapElementToBlock = (element: any) => {
    if (element.type === 'text') {
        return {
            type: BasicType.TEXT,
            attributes: {
                color: element.font?.color,
                'font-size': `${element.font?.size}px`,
                'font-family': element.font?.family,
                'font-weight': element.font?.weight,
                'line-height': element.font?.lineHeight,
                align: element.font?.align || 'left',
                padding: '10px 25px 10px 25px',
            },
            data: {
                value: {
                    content: element.content.replace(/\n/g, '<br/>')
                }
            },
            children: []
        };
    }

    if (element.type === 'image') {
        return {
            type: BasicType.IMAGE,
            attributes: {
                src: element.src,
                width: typeof element.width === 'number' ? `${element.width}px` : '100%',
                height: 'auto',
                align: 'center',
                padding: '10px 0px 10px 0px',
            },
            data: {},
            children: []
        };
    }

    return null;
};

export const getMockTemplate = (id?: number): { pages: any[] } => {
    // Select data based on ID, defaulting to universityChronicleData
    const data = (id === 2) ? campusReviewData : universityChronicleData;

    const pages = data.document.pages.map((pageData, index) => {
        // Determine page type
        let type = 'content';
        if (pageData.id === 'page-cover') type = 'cover';
        else if (pageData.id === 'page-closing') type = 'back_cover';

        const columnChildren: any[] = [];

        // Sort elements by Y position to simulate reading order
        const sortedElements = [...pageData.elements].sort((a: any, b: any) => a.y - b.y);

        sortedElements.forEach(el => {
            const block = mapElementToBlock(el);
            if (block) {
                columnChildren.push(block);
            }
        });

        const columnBlock = {
            type: BasicType.COLUMN,
            attributes: {
                padding: '0px 0px 0px 0px',
                'border': 'none',
                'vertical-align': 'top',
                'background-color': 'transparent',
            },
            data: {},
            children: columnChildren
        };

        const sectionBlock = {
            type: BasicType.SECTION,
            attributes: {
                padding: '20px 0px',
                'background-color': pageData.backgroundColor,
            },
            data: {},
            children: [columnBlock]
        };

        const pageBlock = {
            type: BasicType.PAGE,
            attributes: {
                width: '794px', // A4 equivalent width for editor
                'background-color': pageData.backgroundColor,
            },
            data: {
                value: {
                    fonts: [],
                    verification: {},
                    headAttributes: '',
                    'font-family': 'Montserrat'
                }
            },
            children: [sectionBlock]
        };

        return {
            id: uuidv4(),
            name: type === 'cover' ? 'Front Cover' : (type === 'back_cover' ? 'Closing' : 'Page ' + (index + 1)),
            content: pageBlock,
            order: index,
            type: type
        };
    });

    return { pages };
};
