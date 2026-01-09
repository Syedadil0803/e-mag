import { Stack } from '@demo/components/Stack';
import { useFocusIdx } from 'easy-email-editor';
import { AttributesPanelWrapper, ColorPickerField, TextField } from 'easy-email-extensions';
import React from 'react';

export function Panel() {
  const { focusIdx } = useFocusIdx();
  return (
    <AttributesPanelWrapper style={{ padding: '20px' }}>
      <Stack vertical>
        <TextField
          label='Video URL'
          name={`${focusIdx}.data.value.videoUrl`}
          inline
          placeholder='https://www.youtube.com/watch?v=... or direct video URL'
        />
        <TextField
          label='Thumbnail URL'
          name={`${focusIdx}.data.value.thumbnailUrl`}
          inline
          placeholder='https://example.com/thumbnail.jpg'
        />
        <TextField
          label='Width'
          name={`${focusIdx}.data.value.width`}
          inline
          placeholder='100% or 600px'
        />
        <TextField
          label='Height'
          name={`${focusIdx}.data.value.height`}
          inline
          placeholder='auto or 400px'
        />
        <TextField
          label='Alt Text'
          name={`${focusIdx}.data.value.alt`}
          inline
          placeholder='Video description'
        />
        <ColorPickerField
          label='Background color'
          name={`${focusIdx}.attributes.background-color`}
          inline
        />
        <TextField
          label='Padding'
          name={`${focusIdx}.attributes.padding`}
          inline
          placeholder='10px 0px 10px 0px'
        />
      </Stack>
    </AttributesPanelWrapper>
  );
}
