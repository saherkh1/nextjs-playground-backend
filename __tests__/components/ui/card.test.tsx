import React from 'react';
import { render, screen } from '../../utils/test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(
        <Card data-testid="card">
          <div>Card content</div>
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(<Card data-testid="card">Content</Card>);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass(
        'bg-surface',
        'text-card-foreground',
        'transition-all',
        'duration-fast',
        'ease-ease',
        'border',
        'border-border',
        'shadow-sm',
        'rounded-lg'
      );
    });

    it('merges custom className with default classes', () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('bg-surface'); // Still has default classes
    });

    it('passes through HTML attributes', () => {
      render(
        <Card id="test-card" role="article" data-testid="card">
          Content
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'article');
    });
  });

  describe('CardHeader', () => {
    it('renders children correctly', () => {
      render(
        <CardHeader data-testid="card-header">
          <div>Header content</div>
        </CardHeader>
      );

      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies default header classes', () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>);
      
      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-card-padding');
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 element', () => {
      render(<CardTitle>Test Title</CardTitle>);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Test Title');
    });

    it('applies title-specific classes', () => {
      render(<CardTitle data-testid="card-title">Title</CardTitle>);
      
      const title = screen.getByTestId('card-title');
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-tight',
        'tracking-tight',
        'text-text-primary',
        'font-brand'
      );
    });
  });

  describe('CardDescription', () => {
    it('renders as paragraph element', () => {
      render(<CardDescription>Test description</CardDescription>);
      
      const description = screen.getByText('Test description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
    });

    it('applies description-specific classes', () => {
      render(
        <CardDescription data-testid="card-description">
          Description
        </CardDescription>
      );
      
      const description = screen.getByTestId('card-description');
      expect(description).toHaveClass('text-sm', 'text-text-muted', 'leading-normal', 'font-brand');
    });
  });

  describe('CardContent', () => {
    it('renders children correctly', () => {
      render(
        <CardContent data-testid="card-content">
          <p>Content paragraph</p>
        </CardContent>
      );

      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getByText('Content paragraph')).toBeInTheDocument();
    });

    it('applies content-specific classes', () => {
      render(<CardContent data-testid="card-content">Content</CardContent>);
      
      const content = screen.getByTestId('card-content');
      expect(content).toHaveClass('p-card-padding', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders children correctly', () => {
      render(
        <CardFooter data-testid="card-footer">
          <button>Footer Button</button>
        </CardFooter>
      );

      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
    });

    it('applies footer-specific classes', () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);
      
      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveClass('flex', 'items-center', 'p-card-padding', 'pt-0');
    });
  });

  describe('Complete Card Structure', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Save Changes</button>
          </CardFooter>
        </Card>
      );

      // Check all parts are rendered
      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Profile Settings' })).toBeInTheDocument();
      expect(screen.getByText('Manage your account settings')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });
  });
});