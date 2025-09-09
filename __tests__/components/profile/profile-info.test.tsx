import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { ProfileInfo } from '@/components/profile/profile-info';
import { createMockUser } from '../../utils/test-utils';

describe('ProfileInfo Component', () => {
  const defaultUser = createMockUser();

  it('renders user profile information correctly', () => {
    render(<ProfileInfo user={defaultUser} />);

    // Check if the card title is present
    expect(screen.getByText('Profile Information')).toBeInTheDocument();

    // Check user details
    expect(screen.getByText(`${defaultUser.firstName} ${defaultUser.lastName}`)).toBeInTheDocument();
    expect(screen.getByText(defaultUser.email)).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Studio Owner')).toBeInTheDocument();
    expect(screen.getByText(defaultUser.tenantId)).toBeInTheDocument();
  });

  it('displays field labels correctly', () => {
    render(<ProfileInfo user={defaultUser} />);

    // Check all field labels are present
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Email Status')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Studio ID')).toBeInTheDocument();
    expect(screen.getByText('Member Since')).toBeInTheDocument();
  });

  describe('Date Formatting', () => {
    it('formats creation date correctly', () => {
      const userWithSpecificDate = createMockUser({
        createdAt: '2024-03-15T10:30:00.000Z'
      });

      render(<ProfileInfo user={userWithSpecificDate} />);

      // Check if date is formatted correctly (US format)
      expect(screen.getByText('March 15, 2024')).toBeInTheDocument();
    });

    it('handles different date formats', () => {
      const userWithISODate = createMockUser({
        createdAt: '2023-12-25T15:45:30.123456'
      });

      render(<ProfileInfo user={userWithISODate} />);

      expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
    });
  });

  describe('Email Verification Status', () => {
    it('shows verified status for verified emails', () => {
      const verifiedUser = createMockUser({ emailVerified: true });
      render(<ProfileInfo user={verifiedUser} />);

      const verifiedBadge = screen.getByText('Verified');
      expect(verifiedBadge).toBeInTheDocument();
      expect(verifiedBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('shows unverified status for unverified emails', () => {
      const unverifiedUser = createMockUser({ emailVerified: false });
      render(<ProfileInfo user={unverifiedUser} />);

      const unverifiedBadge = screen.getByText('Unverified');
      expect(unverifiedBadge).toBeInTheDocument();
      expect(unverifiedBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('Role Display', () => {
    it('displays PLATFORM_ADMIN role correctly', () => {
      const adminUser = createMockUser({ platformRole: 'PLATFORM_ADMIN' });
      render(<ProfileInfo user={adminUser} />);

      const roleBadge = screen.getByText('Platform Admin');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('displays TENANT_OWNER role correctly', () => {
      const ownerUser = createMockUser({ platformRole: 'TENANT_OWNER' });
      render(<ProfileInfo user={ownerUser} />);

      const roleBadge = screen.getByText('Studio Owner');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('displays USER role correctly', () => {
      const regularUser = createMockUser({ platformRole: 'USER' });
      render(<ProfileInfo user={regularUser} />);

      const roleBadge = screen.getByText('User');
      expect(roleBadge).toBeInTheDocument();
      expect(roleBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('displays unknown role as-is', () => {
      const userWithUnknownRole = createMockUser({ platformRole: 'CUSTOM_ROLE' as any });
      render(<ProfileInfo user={userWithUnknownRole} />);

      expect(screen.getByText('CUSTOM_ROLE')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('renders with proper grid layout classes', () => {
      const { container } = render(<ProfileInfo user={defaultUser} />);

      // Check for grid layout
      const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });

    it('applies correct styling classes to field containers', () => {
      const { container } = render(<ProfileInfo user={defaultUser} />);

      // Check for field containers with proper spacing
      const fieldContainers = container.querySelectorAll('.space-y-1');
      expect(fieldContainers.length).toBeGreaterThan(0);
    });

    it('renders Studio ID with monospace font', () => {
      render(<ProfileInfo user={defaultUser} />);

      const tenantIdElement = screen.getByText(defaultUser.tenantId);
      expect(tenantIdElement).toHaveClass('font-mono');
    });
  });

  describe('Edge Cases', () => {
    it('handles user with missing or empty names', () => {
      const userWithEmptyNames = createMockUser({
        firstName: '',
        lastName: ''
      });

      render(<ProfileInfo user={userWithEmptyNames} />);

      // Should still render the profile info section
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
      // The empty name section should exist but might just show a space
      const nameSection = screen.getByText('Full Name').closest('.space-y-1');
      expect(nameSection).toBeInTheDocument();
    });

    it('handles user with very long email address', () => {
      const userWithLongEmail = createMockUser({
        email: 'verylongemailaddress@verylongdomainname.example.com'
      });

      render(<ProfileInfo user={userWithLongEmail} />);

      expect(screen.getByText(userWithLongEmail.email)).toBeInTheDocument();
    });

    it('handles user with special characters in name', () => {
      const userWithSpecialChars = createMockUser({
        firstName: 'José',
        lastName: "O'Connor-Smith"
      });

      render(<ProfileInfo user={userWithSpecialChars} />);

      expect(screen.getByText("José O'Connor-Smith")).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      render(<ProfileInfo user={defaultUser} />);

      // Check that field labels are properly associated
      const fullNameLabel = screen.getByText('Full Name');
      expect(fullNameLabel).toBeInTheDocument();

      // Check that status badges have proper text content
      const verifiedStatus = screen.getByText('Verified');
      expect(verifiedStatus).toBeInTheDocument();
    });

    it('provides proper text contrast for badges', () => {
      const verifiedUser = createMockUser({ emailVerified: true });
      render(<ProfileInfo user={verifiedUser} />);

      const verifiedBadge = screen.getByText('Verified');
      // Green badge should have proper contrast classes
      expect(verifiedBadge).toHaveClass('text-green-800');
    });
  });

  describe('Component Integration', () => {
    it('integrates properly with Card components', () => {
      const { container } = render(<ProfileInfo user={defaultUser} />);

      // Should use Card, CardHeader, CardTitle, CardContent components
      expect(container.querySelector('[class*="rounded-lg"]')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Profile Information' })).toBeInTheDocument();
    });
  });
});