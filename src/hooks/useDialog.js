import { useState, useRef, useCallback, useEffect } from 'react';

import { useEphemeralAppContext } from '@/state/EphemeralStateProvider';
const useDialog = ({ onDialogCleared }) => {
  const { state, dispatch } = useEphemeralAppContext()
  const dialog = state.dialog
  const [showDialog, setShowDialog] = useState(false);
  const currDialog = useRef('');
  const setDialogState = useCallback((newState) => {
    dispatch({ type: 'SET_DIALOG', dialog: newState });
  }, [dispatch])

  const clearDialog = useCallback((dialogToClear) => {
    if (dialogToClear === null || currDialog.current === dialogToClear) {
      currDialog.current = '';
      setShowDialog(false);
      setDialogState('');
      onDialogCleared(dialog)
    }
  }, [dialog]);

  const setDialog = useCallback((newDialog) => {
    // only start rerendering the dialog if it is different
    if(newDialog !== currDialog.current){
      clearDialog(null);
    
      // Use a 0 timeout to ensure state updates after the current call stack clears
      setTimeout(() => {
        currDialog.current = newDialog;
        if (newDialog) {
          setShowDialog(true);
          setDialogState(newDialog);
        }
      }, 0);
    }
  }, []);

  // This effect handles synchronization between showDialog and dialog state
  useEffect(() => {
    setDialogState(showDialog ? currDialog.current : '');
  }, [showDialog]);

  return [dialog, setDialog, clearDialog];
};

export default useDialog;