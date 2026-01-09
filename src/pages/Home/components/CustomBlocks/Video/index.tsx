import {
  IBlockData,
  BasicType,
  components,
  createCustomBlock,
  getPreviewClassName,
  AdvancedType,
  mergeBlock,
} from 'easy-email-core';

import { CustomBlocksType } from '../constants';
import React from 'react';

const { Column, Section, Wrapper, Text, Button, Raw } = components;

export type IVideo = IBlockData<
  {
    'background-color': string;
    padding: string;
  },
  {
    videoUrl: string;
    thumbnailUrl: string;
    width: string;
    height: string;
    alt: string;
  }
>;

export const Video = createCustomBlock<IVideo>({
  name: 'Video',
  type: CustomBlocksType.VIDEO,
  validParentType: [
    BasicType.PAGE,
    BasicType.SECTION,
    AdvancedType.SECTION,
    BasicType.COLUMN,
    AdvancedType.COLUMN,
  ],
  create: payload => {
    const defaultData: IVideo = {
      type: CustomBlocksType.VIDEO,
      data: {
        value: {
          videoUrl: '',
          thumbnailUrl: '',
          width: '100%',
          height: 'auto',
          alt: 'Video',
        },
      },
      attributes: {
        'background-color': '#ffffff',
        padding: '10px 0px 10px 0px',
      },
      children: [],
    };
    return mergeBlock(defaultData, payload);
  },
  render: ({ data, idx, mode }) => {
    const { videoUrl = '', thumbnailUrl = '', width = '100%', height = 'auto', alt = 'Video' } = data.data.value;
    const attributes = data.attributes || {};

    const hasVideoUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.trim().length > 0;
    const hasThumbnail = thumbnailUrl && typeof thumbnailUrl === 'string' && thumbnailUrl.trim().length > 0;

    return (
      <Wrapper
        css-class={mode === 'testing' && idx !== undefined ? getPreviewClassName(idx, data.type) : ''}
        padding={attributes.padding}
        border='none'
        direction='ltr'
        text-align='center'
        background-color={attributes['background-color']}
      >
        <Section padding='0px'>
          <Column
            padding='0px'
            border='none'
            vertical-align='top'
          >
            {hasVideoUrl ? (
              <Raw>
                {`<video controls="controls" controlsList="nodownload" preload="metadata" playsinline${hasThumbnail ? ` poster="${thumbnailUrl}"` : ''} style="width: ${width || '100%'}; height: ${height || 'auto'}; max-width: 100%; display: block; margin: 0 auto; background-color: #000;"><source src="${videoUrl}" type="video/mp4" /><source src="${videoUrl}" type="video/webm" /><source src="${videoUrl}" type="video/ogg" />Your browser does not support HTML5 video. <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" style="color: #1890ff; text-decoration: underline;">Click here to watch the video</a></video>`}
              </Raw>
            ) : (
              <Text
                padding='10px'
                align='center'
                color='#999999'
              >
                Please add a video URL
              </Text>
            )}
          </Column>
        </Section>
      </Wrapper>
    );
  },
});

export { Panel } from './Panel';
