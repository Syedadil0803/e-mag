import { AdvancedType } from 'easy-email-core';
import { getUserConfig } from './getUserConfig';
import { ExtensionProps } from 'easy-email-extensions';
import { CustomBlocksType } from '@demo/pages/Home/components/CustomBlocks/constants';

export const USER = getUserConfig({
  // your account
  phone: '12252691060',
  password: '12252691060',
  categoryId: 96,

  // standard user
  provideUserId: 77,
  provideCategoryId: 90,
});

export const FONT_LIST = [
  'Arial',
  'Tahoma',
  'Verdana',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Lato',
  'Montserrat',
].map(item => ({ value: item, label: item }));

export const DEFAULT_CATEGORIES: ExtensionProps['categories'] = [
  {
    label: 'Content',
    active: true,
    blocks: [
      {
        type: AdvancedType.TEXT,
        payload: {
          data: {
            value: {
              content: 'Create beautiful magazine layouts with ease!',
            },
          },
        },
      },
      {
        type: AdvancedType.IMAGE,
        payload: { attributes: { padding: '0px 0px 0px 0px' } },
      },
      {
        type: AdvancedType.SOCIAL,
      },
      {
        type: AdvancedType.DIVIDER,
      },
      {
        type: AdvancedType.SPACER,
      },
      {
        type: CustomBlocksType.VIDEO,
      },
      {
        type: CustomBlocksType.AUDIO,
      },
    ],
  },
  {
    label: 'Layout',
    active: true,
    displayType: 'column',
    blocks: [
      {
        title: 'Custom',
        payload: [['100%']],
      },
      {
        title: '2 columns',
        payload: [
          ['50%', '50%'],
          ['33%', '67%'],
          ['67%', '33%'],
          ['25%', '75%'],
          ['75%', '25%'],
        ],
      },
      {
        title: '3 columns',
        payload: [
          ['33.33%', '33.33%', '33.33%'],
          ['25%', '25%', '50%'],
          ['50%', '25%', '25%'],
        ],
      },
      {
        title: '4 columns',
        payload: [['25%', '25%', '25%', '25%']],
      },
    ],
  },
];
