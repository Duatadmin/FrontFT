// A simple toast utility
export const toast = {
  success: (message: string) => {
    console.log('SUCCESS:', message);
    // Here you would typically call your UI toast component
    // For example: toastComponent.show({ type: 'success', message });
  },
  error: (message: string) => {
    console.error('ERROR:', message);
    // Here you would typically call your UI toast component
    // For example: toastComponent.show({ type: 'error', message });
  },
  info: (message: string) => {
    console.info('INFO:', message);
    // Here you would typically call your UI toast component
    // For example: toastComponent.show({ type: 'info', message });
  }
};
