// Share concurrent initialization, but allow retry after a transient failure.
export function initializeOnce() {
  let pending: Promise<void> | undefined;
  return (initialize: () => Promise<void>) => {
    if (!pending) pending = Promise.resolve().then(initialize).catch(error => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}
