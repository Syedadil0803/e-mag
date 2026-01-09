import React, { useEffect } from 'react';
import { useFormState } from 'react-final-form';
import { useInterval, useLocalStorage } from 'react-use';
import { WarnAboutUnsavedChanges } from './WarnAboutUnsavedChanges';
import { IEmailTemplate } from 'easy-email-editor';
import { getIsFormTouched } from '@demo/utils/getIsFormTouched';
import { useQuery } from '@demo/hooks/useQuery';

export function AutoSaveAndRestoreEmail() {
  const formState = useFormState<any>();
  const { id = 'new' } = useQuery<{ id: string }>();

  const [currentEmail, setCurrentEmail] =
    useLocalStorage<IEmailTemplate | null>(id, null);
  const dirty = getIsFormTouched(formState.touched as any);

  useEffect(() => {
    if (dirty) {
      setCurrentEmail(formState.values);
    }
  }, [dirty, formState.values, setCurrentEmail]);

  useInterval(() => {
    if (dirty) {
      setCurrentEmail(formState.values);
    }
  }, 5000);

  const onBeforeConfirm = () => {
    setCurrentEmail(null);
  };

  return (
    <>
      <WarnAboutUnsavedChanges onBeforeConfirm={onBeforeConfirm} />
    </>
  );
}
