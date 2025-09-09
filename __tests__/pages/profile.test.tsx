import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/(dashboard)/profile/page';
import { createMockUser, createMockApiResponse, createMockApiError } from '../utils/test-utils';
import * as api from '@/lib/api';
import * as authContext from '@/lib/auth/auth-context';

// Mock the API
jest.mock('@/lib/api', () => ({
  api: {
    users: {
      getMe: jest.fn(),
      updateMe: jest.fn(),
    },
  },
}));

// Mock the auth context
jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: jest.fn(),
}));

const mockApi = api.api as jest.Mocked<typeof api.api>;
const mockUseAuth = authContext.useAuth as jest.MockedFunction<typeof authContext.useAuth>;

describe('ProfilePage Integration Tests', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth context mock
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

  describe('Authentication States', () => {
    it('shows login prompt when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        loading: false,
      });

      render(<ProfilePage />);

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Please log in to view your profile.')).toBeInTheDocument();
    });

    it('loads profile data when user is authenticated', async () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      // Should show loading state initially
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
      
      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      // Verify API was called
      expect(mockApi.users.getMe).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows skeleton loading state while fetching profile', async () => {
      // Create a delayed promise
      let resolvePromise: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockApi.users.getMe.mockReturnValue(fetchPromise as any);

      render(<ProfilePage />);

      // Should show skeletons
      const skeletons = screen.getAllByTestId = jest.fn();
      // Check for skeleton elements by class (since skeleton doesn't have testid by default)
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);

      // Resolve the promise
      resolvePromise!(createMockApiResponse(mockUser));

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('shows page header and description', () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
      expect(screen.getByText('Manage your account settings and preferences')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles API fetch errors gracefully', async () => {
      mockApi.users.getMe.mockRejectedValue(
        createMockApiError('Server error', 500)
      );

      render(<ProfilePage />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Profile service temporarily unavailable/)).toBeInTheDocument();
      });

      // Should still show profile data from auth context as fallback
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
    });

    it('provides retry functionality for failed requests', async () => {
      mockApi.users.getMe
        .mockRejectedValueOnce(createMockApiError('Network error'))
        .mockResolvedValueOnce(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await userEvent.setup().click(retryButton);

      // Should retry the API call
      expect(mockApi.users.getMe).toHaveBeenCalledTimes(2);
    });

    it('handles 500 errors with custom message', async () => {
      mockApi.users.getMe.mockRejectedValue(
        createMockApiError('Internal Server Error', 500)
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/Profile service temporarily unavailable/)).toBeInTheDocument();
      });
    });

    it('clears error after successful retry', async () => {
      mockApi.users.getMe
        .mockRejectedValueOnce(createMockApiError('Network error'))
        .mockResolvedValueOnce(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
      });

      // Retry
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await userEvent.setup().click(retryButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Failed to load profile data')).not.toBeInTheDocument();
      });
    });
  });

  describe('Profile Data Integration', () => {
    it('displays profile information correctly', async () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        // Check ProfileInfo component is rendered with correct data
        expect(screen.getByText(`${mockUser.firstName} ${mockUser.lastName}`)).toBeInTheDocument();
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
        expect(screen.getByText('Studio Owner')).toBeInTheDocument();
      });
    });

    it('displays edit form with pre-populated data', async () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        // Check EditProfileForm is rendered with correct data
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
      });
    });

    it('updates profile data after successful edit', async () => {
      const updatedUser = createMockUser({
        firstName: 'Updated',
        lastName: 'Name',
      });

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));
      mockApi.users.updateMe.mockResolvedValue(createMockApiResponse(updatedUser));

      const user = userEvent.setup();
      render(<ProfilePage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
      });

      // Update the form
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');

      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Wait for update to complete
      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });

      // Profile info should be updated
      expect(screen.getByText('Updated Name')).toBeInTheDocument();
    });
  });

  describe('Error State Persistence', () => {
    it('maintains error state when update fails', async () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));
      mockApi.users.updateMe.mockRejectedValue(
        createMockApiError('Update failed', 400)
      );

      const user = userEvent.setup();
      render(<ProfilePage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      // Try to update profile
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Should show update error
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('clears errors after successful profile update', async () => {
      const updatedUser = createMockUser({ firstName: 'Updated' });

      mockApi.users.getMe
        .mockRejectedValueOnce(createMockApiError('Fetch error'))
        .mockResolvedValueOnce(createMockApiResponse(mockUser));

      mockApi.users.updateMe.mockResolvedValue(createMockApiResponse(updatedUser));

      const user = userEvent.setup();
      render(<ProfilePage />);

      // Wait for fetch error
      await waitFor(() => {
        expect(screen.getByText('Failed to load profile data')).toBeInTheDocument();
      });

      // Should still show edit form
      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      // Update profile successfully
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Error should be cleared after successful update
      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
        expect(screen.queryByText('Failed to load profile data')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Composition', () => {
    it('renders all expected UI components', async () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        // Page structure
        expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
        
        // Profile information card
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        
        // Edit form card
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        
        // Form elements
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      });
    });

    it('maintains proper layout structure', () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      const { container } = render(<ProfilePage />);

      // Check for main container with proper spacing
      const mainContainer = container.querySelector('.space-y-6');
      expect(mainContainer).toBeInTheDocument();

      // Check for responsive header layout
      const headerContainer = container.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(headerContainer).toBeInTheDocument();
    });
  });
});