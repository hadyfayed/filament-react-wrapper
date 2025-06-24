// Global window interface extensions
declare global {
  interface Window {
    ReactComponentRegistry?: any;
    ReactWrapperConfig?: any;
    workflowDataSync?: (statePath: string, data: any) => void;
  }
}

export {};