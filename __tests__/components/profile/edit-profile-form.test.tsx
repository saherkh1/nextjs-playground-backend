import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { createMockUser, createMockApiResponse, createMockApiError } from '../../utils/test-utils';

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    users: {
      updateMe: jest.fn(),
    },
  },
}));

// Import the mocked api to get access to the mocked functions
import { api } from '@/lib/api';
const mockApi = api as jest.Mocked<typeof api>;

describe('EditProfileForm Component', () => {
  const defaultUser = createMockUser();
  const mockOnUpdateSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnUpdateSuccess.mockClear();
  });

  it('renders form with user data pre-populated', () => {
    render(
      <EditProfileForm 
        user={defaultUser} 
        onUpdateSuccess={mockOnUpdateSuccess} 
      />
    );

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultUser.firstName)).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultUser.lastName)).toBeInTheDocument();
  });

  it('displays form fields with correct labels', () => {
    render(
      <EditProfileForm 
        user={defaultUser} 
        onUpdateSuccess={mockOnUpdateSuccess} 
      />
    );

    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Clear the first name field
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      
      // Try to submit the form
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('validates minimum length for names', async () => {
      const user = userEvent.setup();
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Enter a single character in first name
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'A');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('validates maximum length for names', async () => {
      const user = userEvent.setup();
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Enter a very long name
      const longName = 'A'.repeat(51); // Assuming max length is 50
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, longName);

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/must be no more than 50 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('successfully submits form with valid data', async () => {
      const user = userEvent.setup();
      const updatedUser = createMockUser({
        firstName: 'Updated',
        lastName: 'Name',
      });

      mockApi.users.updateMe.mockResolvedValue(
        createMockApiResponse(updatedUser)
      );

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Update the form fields
      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Updated');
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'Name');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(mockApi.users.updateMe).toHaveBeenCalledWith({
          firstName: 'Updated',
          lastName: 'Name',
        });
      });

      // Verify success callback was called
      await waitFor(() => {
        expect(mockOnUpdateSuccess).toHaveBeenCalledWith(updatedUser);
      });

      // Verify success message is displayed
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const updatePromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockApi.users.updateMe.mockReturnValue(updatePromise as any);

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make a change to enable the submit button
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolvePromise!(createMockApiResponse(defaultUser));

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockApi.users.updateMe.mockRejectedValue(
        createMockApiError('Validation failed', 400)
      );

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make a change and submit
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument();
      });

      // Verify success callback was not called
      expect(mockOnUpdateSuccess).not.toHaveBeenCalled();
    });

    it('handles backend 500 errors with custom message', async () => {
      const user = userEvent.setup();
      
      mockApi.users.updateMe.mockRejectedValue(
        createMockApiError('Request failed with status code 500', 500)
      );

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make a change and submit
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      // Wait for custom error message for 500 errors
      await waitFor(() => {
        expect(screen.getByText(/Profile update temporarily unavailable/)).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    it('disables submit button when form is not dirty', () => {
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when form has changes', async () => {
      const user = userEvent.setup();
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make a change to the form
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(submitButton).not.toBeDisabled();
    });

    it('resets form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make changes to the form
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Changed');

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Form should be reset to original values
      expect(screen.getByDisplayValue(defaultUser.firstName)).toBeInTheDocument();
    });

    it('clears error messages when cancel is clicked', async () => {
      const user = userEvent.setup();
      
      mockApi.users.updateMe.mockRejectedValue(
        createMockApiError('Test error')
      );

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make a change and submit to trigger error
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });

      // Click cancel to clear error
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('shows success message after successful update', async () => {
      const user = userEvent.setup();
      const updatedUser = createMockUser({ firstName: 'Updated' });

      mockApi.users.updateMe.mockResolvedValue(
        createMockApiResponse(updatedUser)
      );

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Make change and submit
      const firstNameInput = screen.getByLabelText('First Name');
      await user.type(firstNameInput, '!');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('resets form with updated values after successful update', async () => {
      const user = userEvent.setup();
      const updatedUser = createMockUser({
        firstName: 'NewFirst',
        lastName: 'NewLast'
      });

      mockApi.users.updateMe.mockResolvedValue(
        createMockApiResponse(updatedUser)
      );

      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Submit form
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'NewFirst');

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('NewFirst')).toBeInTheDocument();
      });

      // Submit button should be disabled again after successful update
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates labels with form inputs correctly', () => {
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      const firstNameInput = screen.getByLabelText('First Name');
      const lastNameInput = screen.getByLabelText('Last Name');

      expect(firstNameInput).toHaveAttribute('id', 'firstName');
      expect(lastNameInput).toHaveAttribute('id', 'lastName');
    });

    it('displays validation errors with proper styling', async () => {
      const user = userEvent.setup();
      render(
        <EditProfileForm 
          user={defaultUser} 
          onUpdateSuccess={mockOnUpdateSuccess} 
        />
      );

      // Trigger validation error
      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      
      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/first name is required/i);
        expect(errorMessage).toHaveClass('text-red-600');
      });

      // Input should have error styling
      expect(firstNameInput).toHaveClass('border-red-500');
    });
  });
});