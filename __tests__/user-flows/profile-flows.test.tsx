import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ProfilePage from '@/app/(dashboard)/profile/page';
import { createMockUser, createMockApiResponse, createMockApiError } from '../utils/test-utils';
import * as api from '@/lib/api';
import * as authContext from '@/lib/auth/auth-context';

// Mock the API and auth context
jest.mock('@/lib/api');
jest.mock('@/lib/auth/auth-context');

const mockApi = api.api as jest.Mocked<typeof api.api>;
const mockUseAuth = authContext.useAuth as jest.MockedFunction<typeof authContext.useAuth>;

describe('Profile User Flow Tests', () => {
  const mockUser = createMockUser();
  
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('Complete Profile Update Flow', () => {
    it('allows user to successfully update their profile end-to-end', async () => {
      const user = userEvent.setup();
      const updatedUser = createMockUser({
        firstName: 'Updated',
        lastName: 'Username',
        updatedAt: new Date().toISOString(),
      });

      // Mock API responses
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));
      mockApi.users.updateMe.mockResolvedValue(createMockApiResponse(updatedUser));

      render(<ProfilePage />);

      // Step 1: Wait for initial profile data to load
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
      });

      // Step 2: Verify profile information is displayed correctly
      expect(screen.getByText(`${mockUser.firstName} ${mockUser.lastName}`)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText('Studio Owner')).toBeInTheDocument();

      // Step 3: Modify the form fields
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'Username');

      // Step 4: Submit the form
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(submitButton).not.toBeDisabled(); // Should be enabled after changes
      await user.click(submitButton);

      // Step 5: Verify loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Step 6: Wait for success
      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });

      // Step 7: Verify API was called correctly
      expect(mockApi.users.updateMe).toHaveBeenCalledWith({
        firstName: 'Updated',
        lastName: 'Username',
      });

      // Step 8: Verify profile info is updated in the display section
      await waitFor(() => {
        expect(screen.getByText('Updated Username')).toBeInTheDocument();
      });

      // Step 9: Verify form state is reset (submit button disabled)
      expect(submitButton).toBeDisabled();
    });

    it('handles complete error recovery flow', async () => {
      const user = userEvent.setup();

      // Mock initial fetch error, then success on retry
      mockApi.users.getMe
        .mockRejectedValueOnce(createMockApiError('Server temporarily unavailable', 500))
        .mockResolvedValueOnce(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      // Step 1: Wait for initial error
      await waitFor(() => {
        expect(screen.getByText(/Profile service temporarily unavailable/)).toBeInTheDocument();
      });

      // Step 2: Verify retry button is available
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();

      // Step 3: Click retry
      await user.click(retryButton);

      // Step 4: Verify successful retry
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.queryByText(/Profile service temporarily unavailable/)).not.toBeInTheDocument();
      });

      // Step 5: Verify can now interact with form
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUser.firstName)).toBeInTheDocument();
    });

    it('handles form validation and correction flow', async () => {
      const user = userEvent.setup();

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      // Step 1: Clear required field to trigger validation
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);

      // Step 2: Try to submit invalid form
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Step 3: Verify validation error appears
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });

      // Step 4: Verify form has error styling
      expect(firstNameInput).toHaveClass('border-red-500');

      // Step 5: Correct the error
      await user.type(firstNameInput, 'Corrected');

      // Step 6: Submit should now work (mock successful response)
      const updatedUser = createMockUser({ firstName: 'Corrected' });
      mockApi.users.updateMe.mockResolvedValue(createMockApiResponse(updatedUser));

      await user.click(submitButton);

      // Step 7: Verify success
      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });

      // Step 8: Verify error message is gone
      expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
      expect(firstNameInput).not.toHaveClass('border-red-500');
    });
  });

  describe('Edge Case User Flows', () => {
    it('handles user with minimal data', async () => {
      const minimalUser = createMockUser({
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.co',
        platformRole: 'USER',
        emailVerified: false,
      });

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(minimalUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('A B')).toBeInTheDocument();
        expect(screen.getByText('a@b.co')).toBeInTheDocument();
        expect(screen.getByText('User')).toBeInTheDocument();
        expect(screen.getByText('Unverified')).toBeInTheDocument();
      });

      // Should still be able to edit
      expect(screen.getByLabelText('First Name')).toHaveValue('A');
      expect(screen.getByLabelText('Last Name')).toHaveValue('B');
    });

    it('handles user with very long data', async () => {
      const longDataUser = createMockUser({
        firstName: 'Verylongfirstnamethatexceedsnormallimits',
        lastName: 'Equallylonglastnamethatmightcauseissues',
        email: 'verylongemailaddressthatmightcausedisplayissues@veryverylongdomainname.example.com',
      });

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(longDataUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/Verylongfirstnamethatexceedsnormallimits Equallylonglastnamethatmightcauseissues/)).toBeInTheDocument();
        expect(screen.getByText(/verylongemailaddressthatmightcausedisplayissues@veryverylongdomainname.example.com/)).toBeInTheDocument();
      });

      // Form should handle long values
      const firstNameInput = screen.getByLabelText('First Name');
      expect(firstNameInput).toHaveValue('Verylongfirstnamethatexceedsnormallimits');
    });

    it('handles user with special characters and unicode', async () => {
      const unicodeUser = createMockUser({
        firstName: 'José María',
        lastName: "O'Connor-Smith 张三",
        email: 'josé.maría@ñoño.es',
      });

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(unicodeUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText("José María O'Connor-Smith 张三")).toBeInTheDocument();
        expect(screen.getByText('josé.maría@ñoño.es')).toBeInTheDocument();
      });

      // Should be able to edit unicode characters
      const firstNameInput = screen.getByLabelText('First Name');
      expect(firstNameInput).toHaveValue('José María');
    });
  });

  describe('Network and Error Recovery Flows', () => {
    it('handles intermittent network issues during update', async () => {
      const user = userEvent.setup();

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      // First update fails with network error, second succeeds
      const updatedUser = createMockUser({ firstName: 'Persistent' });
      mockApi.users.updateMe
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce(createMockApiResponse(updatedUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      // First attempt - network failure
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Persistent');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });

      // Second attempt - success
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });

      expect(screen.queryByText('Network Error')).not.toBeInTheDocument();
    });

    it('handles authentication expiry during profile interaction', async () => {
      const user = userEvent.setup();

      // Initial fetch works
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      // Update fails with 401
      mockApi.users.updateMe.mockRejectedValue(
        createMockApiError('Unauthorized', 401)
      );

      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Unauthorized')).toBeInTheDocument();
      });
    });
  });

  describe('Concurrent User Interaction Flows', () => {
    it('handles rapid form interactions correctly', async () => {
      const user = userEvent.setup();
      
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First Name');
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      // Rapid edits and cancel
      await user.type(firstNameInput, 'Quick');
      await user.click(cancelButton);

      // Verify form reset
      expect(firstNameInput).toHaveValue(mockUser.firstName);

      // Quick edit again
      await user.type(firstNameInput, 'Change');
      expect(screen.getByRole('button', { name: 'Save Changes' })).not.toBeDisabled();
    });

    it('prevents double submission during save', async () => {
      const user = userEvent.setup();
      
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      // Create a delayed promise to simulate slow network
      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      mockApi.users.updateMe.mockReturnValue(updatePromise as any);

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      // Make change
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      // Click submit button multiple times rapidly
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);
      await user.click(submitButton); // Second click
      await user.click(submitButton); // Third click

      // Should show loading state and button disabled
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // API should only be called once
      expect(mockApi.users.updateMe).toHaveBeenCalledTimes(1);

      // Resolve the promise
      const updatedUser = createMockUser({ firstName: mockUser.firstName + '!' });
      resolveUpdate!(createMockApiResponse(updatedUser));

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility User Flows', () => {
    it('supports keyboard navigation through entire flow', async () => {
      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      // Tab navigation should work
      firstNameInput.focus();
      expect(document.activeElement).toBe(firstNameInput);

      // Keyboard input
      await userEvent.setup().keyboard('{End}!');
      expect(firstNameInput).toHaveValue(mockUser.firstName + '!');

      // Tab to next field
      await userEvent.setup().keyboard('{Tab}');
      expect(document.activeElement).toBe(lastNameInput);

      // Tab to buttons
      await userEvent.setup().keyboard('{Tab}');
      expect(document.activeElement).toBe(submitButton);

      await userEvent.setup().keyboard('{Tab}');
      expect(document.activeElement).toBe(cancelButton);
    });

    it('provides proper error feedback for screen readers', async () => {
      const user = userEvent.setup();

      mockApi.users.getMe.mockResolvedValue(createMockApiResponse(mockUser));

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      });

      // Clear field to trigger validation
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);

      // Submit to trigger error
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/first name is required/i);
        expect(errorMessage).toBeInTheDocument();
        
        // Error should be properly associated with input
        expect(errorMessage).toHaveClass('text-red-600');
        expect(firstNameInput).toHaveClass('border-red-500');
      });
    });
  });
});