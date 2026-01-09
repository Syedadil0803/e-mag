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
          label='Audio URL'
          name={`${focusIdx}.data.value.audioUrl`}
          inline
          placeholder='https://example.com/audio.mp3'
        />
        <TextField
          label='Title'
          name={`${focusIdx}.data.value.title`}
          inline
          placeholder='Audio title'
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
