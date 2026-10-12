import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';

export const UNSAVED_CHANGES_MESSAGE = 'You have unsaved changes. Leave this page and discard them?';

// Warns before details typed into a form are lost: on closing or reloading the tab (browser prompt) and on
// in-app navigation to another page (confirm). Needs a data router, which the app and the test helpers use.
export function useUnsavedChangesWarning(shouldWarn) {
  const warnRef = useRef(shouldWarn);
  warnRef.current = shouldWarn;

  useEffect(() => {
    if (!shouldWarn) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [shouldWarn]);

  // Moving within the same page (for example a changed search string) is not leaving the form.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => warnRef.current && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm(UNSAVED_CHANGES_MESSAGE)) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
}
