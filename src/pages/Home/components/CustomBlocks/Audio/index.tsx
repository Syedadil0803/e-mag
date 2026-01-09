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

const { Column, Section, Wrapper, Text, Raw } = components;

export type IAudio = IBlockData<
  {
    'background-color': string;
    padding: string;
  },
  {
    audioUrl: string;
    title: string;
  }
>;

export const Audio = createCustomBlock<IAudio>({
  name: 'Audio',
  type: CustomBlocksType.AUDIO,
  validParentType: [
    BasicType.PAGE,
    BasicType.SECTION,
    AdvancedType.SECTION,
    BasicType.COLUMN,
    AdvancedType.COLUMN,
  ],
  create: payload => {
    const defaultData: IAudio = {
      type: CustomBlocksType.AUDIO,
      data: {
        value: {
          audioUrl: '',
          title: 'Audio',
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
    const { audioUrl = '', title = 'Audio' } = data.data.value;
    const attributes = data.attributes || {};
    const hasAudioUrl = audioUrl && typeof audioUrl === 'string' && audioUrl.trim().length > 0;

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
            {hasAudioUrl ? (
              <Raw>
                {`<audio controls="controls" controlsList="nodownload" preload="metadata" style="width: 100%; max-width: 500px; display: block; margin: 10px auto;"><source src="${audioUrl}" type="audio/mpeg" /><source src="${audioUrl}" type="audio/ogg" /><source src="${audioUrl}" type="audio/wav" />Your browser does not support HTML5 audio. <a href="${audioUrl}" target="_blank" rel="noopener noreferrer" style="color: #1890ff; text-decoration: underline;">Click here to listen to the audio</a></audio>`}
              </Raw>
            ) : (
              <Text
                padding='10px'
                align='center'
                color='#999999'
              >
                Please add an audio URL
              </Text>
            )}
          </Column>
        </Section>
      </Wrapper>
    );
  },
});

export { Panel } from './Panel';
