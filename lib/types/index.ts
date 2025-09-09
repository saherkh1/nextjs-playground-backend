// Re-export all types for easier imports
export * from './api';
export * from './auth';
export * from './tenant';

// Common types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface FormFieldError {
  message: string;
}