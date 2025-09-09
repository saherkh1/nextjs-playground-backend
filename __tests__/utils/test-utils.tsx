import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Add a test to ensure this file passes jest's requirement
describe('Test Utils', () => {
  it('should export utility functions', () => {
    expect(createMockUser).toBeDefined();
    expect(createMockApiResponse).toBeDefined();
    expect(createMockApiError).toBeDefined();
  });
});

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data utilities
export const createMockUser = (overrides = {}) => ({
  ...global.mockUser,
  ...overrides,
});

export const createMockApiResponse = (data: any, success = true) => ({
  success,
  data,
  timestamp: new Date().toISOString(),
  ...(success ? {} : { error: 'Mock error', message: 'Mock error message' }),
});

export const createMockApiError = (message = 'API Error', status = 500) => {
  const error = new Error(message) as any;
  error.response = {
    status,
    data: {
      success: false,
      error: message,
      message,
      timestamp: new Date().toISOString(),
    },
  };
  return error;
};

// Wait for element to appear/disappear helpers
export const waitForElementToAppear = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};

export const waitForElementToDisappear = async (text: string | RegExp) => {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
};

// Form test utilities
export const fillInput = async (labelText: string, value: string) => {
  const user = userEvent.setup();
  const input = screen.getByLabelText(labelText);
  await user.clear(input);
  await user.type(input, value);
  return input;
};

export const clickButton = async (buttonText: string | RegExp) => {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: buttonText });
  await user.click(button);
  return button;
};

// Assertion helpers
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectInputToHaveValue = (labelText: string, value: string) => {
  const input = screen.getByLabelText(labelText);
  expect(input).toHaveValue(value);
};

export const expectButtonToBeDisabled = (buttonText: string | RegExp) => {
  const button = screen.getByRole('button', { name: buttonText });
  expect(button).toBeDisabled();
};

export const expectButtonToBeEnabled = (buttonText: string | RegExp) => {
  const button = screen.getByRole('button', { name: buttonText });
  expect(button).not.toBeDisabled();
};

// Re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };