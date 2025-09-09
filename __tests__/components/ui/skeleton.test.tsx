import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton Component', () => {
  it('renders skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies default skeleton classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
  });

  it('merges custom className with default classes', () => {
    render(
      <Skeleton 
        className="h-4 w-32 custom-skeleton" 
        data-testid="skeleton" 
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-4', 'w-32', 'custom-skeleton');
    expect(skeleton).toHaveClass('animate-pulse'); // Still has default classes
  });

  it('passes through HTML attributes', () => {
    render(
      <Skeleton
        id="profile-skeleton"
        role="status"
        aria-label="Loading profile"
        data-testid="skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('id', 'profile-skeleton');
    expect(skeleton).toHaveAttribute('role', 'status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading profile');
  });

  it('can be used to create different skeleton shapes', () => {
    render(
      <div>
        <Skeleton className="h-8 w-48" data-testid="title-skeleton" />
        <Skeleton className="h-4 w-32 mt-2" data-testid="subtitle-skeleton" />
        <Skeleton className="h-12 w-12 rounded-full" data-testid="avatar-skeleton" />
      </div>
    );
    
    // Check that different skeletons are rendered with their specific classes
    expect(screen.getByTestId('title-skeleton')).toHaveClass('h-8', 'w-48');
    expect(screen.getByTestId('subtitle-skeleton')).toHaveClass('h-4', 'w-32', 'mt-2');
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('h-12', 'w-12', 'rounded-full');
    
    // All should still have default skeleton classes
    expect(screen.getByTestId('title-skeleton')).toHaveClass('animate-pulse');
    expect(screen.getByTestId('subtitle-skeleton')).toHaveClass('animate-pulse');
    expect(screen.getByTestId('avatar-skeleton')).toHaveClass('animate-pulse');
  });

  it('renders as div element by default', () => {
    render(<Skeleton data-testid="skeleton">Loading...</Skeleton>);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
  });

  it('can contain children content', () => {
    render(
      <Skeleton data-testid="skeleton">
        <span>Loading content...</span>
      </Skeleton>
    );
    
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('can be made accessible with proper ARIA attributes', () => {
      render(
        <Skeleton
          role="status"
          aria-live="polite"
          aria-label="Loading user profile"
          data-testid="accessible-skeleton"
        />
      );
      
      const skeleton = screen.getByTestId('accessible-skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-live', 'polite');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
    });
  });

  describe('Profile Loading Skeleton Pattern', () => {
    it('can create a profile loading skeleton layout', () => {
      render(
        <div data-testid="profile-skeleton-layout">
          {/* Avatar */}
          <Skeleton className="h-16 w-16 rounded-full" />
          
          {/* Name and email */}
          <div className="ml-4 flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          {/* Role badge */}
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      );
      
      const layout = screen.getByTestId('profile-skeleton-layout');
      expect(layout).toBeInTheDocument();
      
      // Check that all skeleton elements are present
      const skeletons = layout.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(4);
    });
  });
});