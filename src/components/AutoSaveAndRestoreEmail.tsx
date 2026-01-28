import React, { useEffect, useRef } from 'react';
import { useForm, useFormState } from 'react-final-form';
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

  const form = useForm();
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    return () => {
      // Autosave on unmount only if there are changes
      if (formRef.current && dirty) {
        formRef.current.submit();
      }
    };
  }, [dirty]);

  return (
    <>
      <WarnAboutUnsavedChanges onBeforeConfirm={onBeforeConfirm} />
    </>
  );
}
