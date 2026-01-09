import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Prompt } from 'react-router-dom';
import { useFormState } from 'react-final-form';
import { getIsFormTouched } from '@demo/utils/getIsFormTouched';
import { ConfirmBeforeLeavePage } from '@demo/utils/ConfirmBeforeLeavePage';
import { Modal } from '@arco-design/web-react';
import { useQuery } from '@demo/hooks/useQuery';

interface WarnAboutUnsavedChangesProps {
  dirty?: boolean;
  pageUnload?: boolean;
  onBeforeConfirm?: () => void;
}

export function WarnAboutUnsavedChanges(props: WarnAboutUnsavedChangesProps) {
  const { pageUnload = true } = props;
  const formState = useFormState<any>();
  const { id = 'new' } = useQuery<{ id: string }>();
  const callbackRef = useRef<null | ((isOk: boolean) => any)>(null);
  const [visible, setVisible] = useState(false);
  const isTouched = getIsFormTouched(formState.touched as any);
  const hasLocalStorageData = typeof window !== 'undefined' && localStorage.getItem(id) !== null;
  const isDirty = !formState.pristine || isTouched || hasLocalStorageData || props.dirty;
  const openConfirmModal = useCallback(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    ConfirmBeforeLeavePage.register((callback) => {
      if (isDirty) {
        callbackRef.current = callback;
        props.onBeforeConfirm?.();
        openConfirmModal();
      }
    });

    return () => {
      ConfirmBeforeLeavePage.unregister();
    };
  }, [openConfirmModal, isDirty, props]);

  useEffect(() => {
    if (pageUnload) {
      const onCheckUnsaved = (event: BeforeUnloadEvent) => {
        if (isDirty) {
          event.preventDefault();
          event.returnValue = 'Changes that you made may not be saved.';
          return event.returnValue;
        }
      };

      window.addEventListener('beforeunload', onCheckUnsaved);

      return () => {
        window.removeEventListener('beforeunload', onCheckUnsaved);
      };
    }
  }, [isDirty, pageUnload, id]);

  const onCancel = useCallback(() => {
    callbackRef.current?.(false);
    setVisible(false);
  }, []);

  const onOk = useCallback(() => {
    props.onBeforeConfirm?.();
    callbackRef.current?.(true);
  }, []);

  return (
    <>
      <Modal
        title='Discard changes?'
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        okText='Discard'
        cancelText='Cancel'
        style={{ zIndex: 10000 }}
      >
        <p>Are you sure you want to discard all unsaved changes?</p>
      </Modal>
      {isDirty && <Prompt when message='' />}
    </>
  );
}
