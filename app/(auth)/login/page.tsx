'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H2, P } from '@/components/ui/typography';
import { useLoginForm } from '@/lib/hooks/use-auth-form';
import { Loader2, AlertCircle, Camera } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';
import { useCelebration, Celebration } from '@/components/ui/celebration';
import * as React from 'react';

/* provenance: agent=WHIMSY-INJECTOR action=updated timestamp=2025-09-07T19:35:00Z */

export default function LoginPage() {
  const { form, onSubmit, isSubmitting, error, clearError } = useLoginForm();
  const { toast } = useToast();
  const { celebrate, showCelebration, celebrationType, hideCelebration } = useCelebration();
  const [showWelcome, setShowWelcome] = React.useState(false);
  
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const email = watch('email');
  const password = watch('password');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center mb-4 animate-fade-in">
          <div className="p-3 bg-primary/10 rounded-full">
            <Camera className="w-8 h-8 text-primary" />
          </div>
        </div>
        <H2 className="animate-slide-up">Welcome back</H2>
        <P className="text-text-secondary animate-slide-up" style={{ animationDelay: '100ms' }}>
          Sign in to your PhotoFlow account and continue creating magic
        </P>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-3 text-error bg-error-light p-4 rounded-base border border-error/20 animate-slide-up">
            <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse" />
            <span className="text-sm font-medium flex-1">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="flex-shrink-0 text-error hover:text-error/80 transition-all duration-fast p-1 rounded-xs hover:bg-error/10 hover:scale-110 active:scale-95"
              aria-label="Dismiss error"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-text-primary font-medium">Email address</Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            error={!!errors.email}
            className="transition-all"
          />
          {errors.email && (
            <p className="text-sm text-error font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-text-primary font-medium">Password</Label>
          <Input
            {...register('password')}
            id="password"
            type="password"
            placeholder="Enter your password"
            disabled={isSubmitting}
            error={!!errors.password}
            className="transition-all"
          />
          {errors.password && (
            <p className="text-sm text-error font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="rounded-xs border-input-border text-primary shadow-sm focus:ring-primary focus:ring-offset-0 focus:ring-2"
            />
            <Label htmlFor="remember" className="text-sm text-text-secondary">
              Remember me
            </Label>
          </div>
          <Link 
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="photographer"
          size="lg"
          disabled={isSubmitting || !email || !password}
          className="w-full group relative overflow-hidden"
          onClick={() => {
            // Add celebration on successful login (would be triggered by success in useLoginForm)
            if (!isSubmitting && email && password) {
              setTimeout(() => {
                setShowWelcome(true);
              }, 1000); // Simulate successful login
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="animate-pulse">Signing in...</span>
            </>
          ) : (
            <>
              <span className="relative z-10 group-hover:animate-pulse">Sign in to PhotoFlow</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
        <P className="text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link 
            href="/register"
            className="font-medium text-primary hover:text-primary-hover transition-all duration-fast underline-offset-4 hover:underline hover:scale-105 inline-block"
          >
            Create account
          </Link>
        </P>
      </div>
      
      {/* Success celebration */}
      {showCelebration && celebrationType && (
        <Celebration 
          type={celebrationType}
          show={showCelebration}
          onComplete={hideCelebration}
        />
      )}
      
      {/* Welcome animation */}
      {showWelcome && (
        <div className="fixed inset-0 z-toast flex items-center justify-center pointer-events-none">
          <div className="animate-slide-up bg-primary text-primary-foreground px-8 py-4 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <Camera className="w-6 h-6 animate-bounce" />
              <span className="text-lg font-medium">Welcome back to PhotoFlow! ✨</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}