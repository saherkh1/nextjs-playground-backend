// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  details?: unknown;
}

// Pagination
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    first: boolean;
    last: boolean;
  };
  timestamp: string;
}