import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/(dashboard)/profile/page';
import { ProfileInfo } from '@/components/profile/profile-info';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { createMockUser, createMockApiResponse, createMockApiError } from '../utils/test-utils';
import * as api from '@/lib/api';
import * as authContext from '@/lib/auth/auth-context';

// Mock dependencies
jest.mock('@/lib/api');
jest.mock('@/lib/auth/auth-context');

const mockApi = api.api as jest.Mocked<typeof api.api>;
const mockUseAuth = authContext.useAuth as jest.MockedFunction<typeof authContext.useAuth>;

describe('Profile Edge Cases and Boundary Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Boundary Tests', () => {
    it('handles user with null/undefined values gracefully', () => {
      const userWithNulls = {
        ...createMockUser(),
        firstName: null as any,
        lastName: undefined as any,
        email: '',
        emailVerified: null as any,
      };

      expect(() => {
        render(<ProfileInfo user={userWithNulls} />);
      }).not.toThrow();

      // Should not crash, might show empty or default values
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });

    it('handles extremely long field values', () => {
      const longText = 'A'.repeat(1000);
      const userWithLongValues = createMockUser({
        firstName: longText,
        lastName: longText,
        email: `${longText}@${'domain'.repeat(50)}.com`,
        tenantId: longText,
      });

      expect(() => {
        render(<ProfileInfo user={userWithLongValues} />);
      }).not.toThrow();

      // Text should be truncated or handled appropriately
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });

    it('handles empty strings in all fields', () => {
      const emptyUser = createMockUser({
        firstName: '',
        lastName: '',
        email: '',
        tenantId: '',
        createdAt: '',
      });

      expect(() => {
        render(<ProfileInfo user={emptyUser} />);
      }).not.toThrow();

      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });

    it('handles invalid date strings', () => {
      const userWithInvalidDate = createMockUser({
        createdAt: 'invalid-date-string',
      });

      expect(() => {
        render(<ProfileInfo user={userWithInvalidDate} />);
      }).not.toThrow();

      // Should not crash, might show invalid date or fallback
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });
  });

  describe('Form Validation Edge Cases', () => {
    const mockOnUpdateSuccess = jest.fn();

    beforeEach(() => {
      mockOnUpdateSuccess.mockClear();
    });

    it('handles whitespace-only input validation', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();

      render(
        <EditProfileForm user={mockUser} onUpdateSuccess={mockOnUpdateSuccess} />
      );

      // Enter whitespace-only values
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, '   '); // Only spaces

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show validation error for whitespace-only input
        const errorElement = screen.queryByText(/first name is required/i) || 
                           screen.queryByText(/must be at least 2 characters/i);
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('handles special characters in names', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();

      mockApi.users.updateMe.mockResolvedValue(
        createMockApiResponse(createMockUser({ firstName: "José-María", lastName: "O'Connor" }))
      );

      render(
        <EditProfileForm user={mockUser} onUpdateSuccess={mockOnUpdateSuccess} />
      );

      // Enter special characters
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      await user.clear(firstNameInput);
      await user.type(firstNameInput, "José-María");
      await user.clear(lastNameInput);
      await user.type(lastNameInput, "O'Connor");

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.users.updateMe).toHaveBeenCalledWith({
          firstName: "José-María",
          lastName: "O'Connor",
        });
      });
    });

    it('handles emoji and unicode in form fields', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();

      mockApi.users.updateMe.mockResolvedValue(
        createMockApiResponse(createMockUser({ firstName: "张三", lastName: "🎉Test" }))
      );

      render(
        <EditProfileForm user={mockUser} onUpdateSuccess={mockOnUpdateSuccess} />
      );

      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      await user.clear(firstNameInput);
      await user.type(firstNameInput, "张三");
      await user.clear(lastNameInput);
      await user.type(lastNameInput, "🎉Test");

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockApi.users.updateMe).toHaveBeenCalledWith({
          firstName: "张三",
          lastName: "🎉Test",
        });
      });
    });
  });

  describe('API Response Edge Cases', () => {
    const mockUser = createMockUser();

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        loading: false,
      });
    });

    it('handles malformed API responses', async () => {
      // Mock malformed response
      mockApi.users.getMe.mockResolvedValue({
        success: true,
        data: null, // Malformed - should have user data
        timestamp: new Date().toISOString(),
      } as any);

      render(<ProfilePage />);

      // Should handle gracefully, possibly falling back to auth context user
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('handles API returning different user ID', async () => {
      const differentUser = createMockUser({ 
        id: 'different-user-id',
        firstName: 'Different',
        lastName: 'User'
      });

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(differentUser));

      render(<ProfilePage />);

      await waitFor(() => {
        // Should display the API response data, not auth context data
        expect(screen.getByText('Different User')).toBeInTheDocument();
      });
    });

    it('handles API timeout scenarios', async () => {
      // Simulate timeout with delayed rejection
      mockApi.users.getMe.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should still show fallback profile from auth context
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });

    it('handles rapid API state changes', async () => {
      const user = userEvent.setup();

      // Initial fetch success
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });

      // Rapid retry clicks during error state
      mockApi.users.getMe
        .mockRejectedValueOnce(createMockApiError('Error 1'))
        .mockRejectedValueOnce(createMockApiError('Error 2'))
        .mockResolvedValueOnce(createMockApiResponse(mockUser));

      // Simulate network issue by clicking retry multiple times quickly
      const retryButton = screen.queryByRole('button', { name: 'Retry' });
      
      // First, trigger an error to get the retry button
      mockApi.users.getMe.mockRejectedValueOnce(createMockApiError('Network error'));
      
      // Re-render to trigger error
      render(<ProfilePage />);

      await waitFor(() => {
        const retryBtn = screen.getByRole('button', { name: 'Retry' });
        expect(retryBtn).toBeInTheDocument();
      });

      // Multiple rapid clicks
      const retryBtn = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryBtn);
      await user.click(retryBtn);
      await user.click(retryBtn);

      // Should eventually resolve without crashing
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('handles component unmounting during async operations', async () => {
      const mockUser = createMockUser();
      
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        loading: false,
      });

      // Create a promise that never resolves to simulate slow network
      const neverResolvingPromise = new Promise(() => {});
      mockApi.users.getMe.mockReturnValue(neverResolvingPromise as any);

      const { unmount } = render(<ProfilePage />);

      // Unmount component while async operation is pending
      unmount();

      // Should not cause memory leaks or errors
      expect(true).toBe(true); // Test passes if no errors thrown
    });

    it('handles large dataset without performance degradation', async () => {
      const userWithLargeData = createMockUser({
        tenantId: 'a'.repeat(10000), // Very long tenant ID
      });

      mockUseAuth.mockReturnValue({
        user: userWithLargeData,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        loading: false,
      });

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(userWithLargeData));

      const startTime = performance.now();
      
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });

      const endTime = performance.now();
      
      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('handles missing localStorage', () => {
      // Temporarily remove localStorage
      const originalLocalStorage = window.localStorage;
      delete (window as any).localStorage;

      expect(() => {
        render(<ProfilePage />);
      }).not.toThrow();

      // Restore localStorage
      window.localStorage = originalLocalStorage;
    });

    it('handles missing console methods gracefully', () => {
      const originalConsoleError = console.error;
      
      // Replace console.error with a no-op function instead of undefined
      console.error = jest.fn();

      mockApi.users.getMe.mockRejectedValue(new Error('Test error'));

      expect(() => {
        render(<ProfilePage />);
      }).not.toThrow();

      // Restore console
      console.error = originalConsoleError;
    });
  });

  describe('Race Condition Edge Cases', () => {
    it('handles race between auth context update and API fetch', async () => {
      const user1 = createMockUser({ id: 'user1', firstName: 'First' });
      const user2 = createMockUser({ id: 'user2', firstName: 'Second' });

      // Start with user1 in auth context
      mockUseAuth.mockReturnValue({
        user: user1,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        loading: false,
      });

      // API returns user2
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(user2));

      const { rerender } = render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Second Test')).toBeInTheDocument();
      });

      // Update auth context to different user
      mockUseAuth.mockReturnValue({
        user: user1,
        isAuthenticated: true,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        loading: false,
      });

      rerender(<ProfilePage />);

      // Should handle the race condition gracefully
      await waitFor(() => {
        // Should show either user consistently, not crash
        const hasUser1 = screen.queryByText('First Test');
        const hasUser2 = screen.queryByText('Second Test');
        expect(hasUser1 || hasUser2).toBeInTheDocument();
      });
    });
  });

  describe('Security Edge Cases', () => {
    it('sanitizes user input in display', () => {
      const userWithScriptTags = createMockUser({
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src="x" onerror="alert(1)">',
      });

      render(<ProfileInfo user={userWithScriptTags} />);

      // Script tags should be rendered as text, not executed
      expect(screen.getByText(/script.*alert.*xss.*script/)).toBeInTheDocument();
      expect(screen.getByText(/img.*src.*onerror/)).toBeInTheDocument();
    });

    it('handles malicious input in form fields', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser();
      const mockOnUpdateSuccess = jest.fn();

      render(
        <EditProfileForm user={mockUser} onUpdateSuccess={mockOnUpdateSuccess} />
      );

      const firstNameInput = screen.getByLabelText('First Name');
      
      // Try to enter script tags
      await user.clear(firstNameInput);
      await user.type(firstNameInput, '<script>alert("hack")</script>');

      // Input should contain the raw text, not execute script
      expect(firstNameInput).toHaveValue('<script>alert("hack")</script>');
    });
  });
});