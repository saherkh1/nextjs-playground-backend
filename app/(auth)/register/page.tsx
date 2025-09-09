'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { H2, P } from '@/components/ui/typography';
import { useRegisterForm } from '@/lib/hooks/use-auth-form';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/lib/hooks/use-toast';

export default function RegisterPage() {
  const { form, onSubmit, isSubmitting, isSuccess, error, clearError } = useRegisterForm();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const password = watch('password');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');

  // Password strength indicators
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, feedback: [] };
    
    const checks = [
      { test: pwd.length >= 8, text: 'At least 8 characters' },
      { test: /[a-z]/.test(pwd), text: 'One lowercase letter' },
      { test: /[A-Z]/.test(pwd), text: 'One uppercase letter' },
      { test: /\d/.test(pwd), text: 'One number' },
      { test: /[@$!%*?&]/.test(pwd), text: 'One special character' },
    ];
    
    const score = checks.filter(check => check.test).length;
    return { score, feedback: checks };
  };

  const passwordStrength = getPasswordStrength(password || '');
  const isFormValid = firstName && lastName && email && password && !Object.keys(errors).length;

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-light border-2 border-success/20">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div className="space-y-2">
            <H2>Check your email</H2>
            <P className="text-text-secondary max-w-md mx-auto">
              We&apos;ve sent a verification link to your email address. 
              Click the link to activate your account and start using PhotoFlow.
            </P>
          </div>
        </div>

        <div className="text-center space-y-4">
          <P className="text-sm text-text-muted">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button className="text-primary hover:text-primary-hover font-medium transition-colors underline-offset-4 hover:underline">
              resend verification
            </button>
          </P>
          
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <H2>Create your account</H2>
        <P className="text-text-secondary">
          Join thousands of photographers using PhotoFlow
        </P>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-3 text-error bg-error-light p-4 rounded-base border border-error/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="flex-shrink-0 text-error hover:text-error/80 transition-colors p-1 rounded-xs hover:bg-error/10"
              aria-label="Dismiss error"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-text-primary font-medium">First name</Label>
            <Input
              {...register('firstName')}
              id="firstName"
              placeholder="John"
              disabled={isSubmitting}
              error={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-sm text-error font-medium">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-text-primary font-medium">Last name</Label>
            <Input
              {...register('lastName')}
              id="lastName"
              placeholder="Doe"
              disabled={isSubmitting}
              error={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="text-sm text-error font-medium">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-text-primary font-medium">Email address</Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            error={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-error font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-text-primary font-medium">Password</Label>
          <div className="relative">
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              disabled={isSubmitting}
              error={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i <= passwordStrength.score
                        ? passwordStrength.score < 3
                          ? 'bg-error'
                          : passwordStrength.score < 5
                          ? 'bg-warning'
                          : 'bg-success'
                        : 'bg-surface-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs space-y-1">
                {passwordStrength.feedback.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center space-x-2 ${
                      check.test ? 'text-success' : 'text-text-muted'
                    }`}
                  >
                    <div className={`w-1 h-1 rounded-full ${
                      check.test ? 'bg-success' : 'bg-surface-muted'
                    }`} />
                    <span>{check.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-error font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 rounded-xs border-input-border text-primary shadow-sm focus:ring-primary focus:ring-offset-0 focus:ring-2"
          />
          <Label htmlFor="terms" className="text-sm text-text-secondary">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          variant="photographer"
          size="lg"
          disabled={isSubmitting || !isFormValid}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create PhotoFlow account'
          )}
        </Button>
      </form>

      <div className="text-center">
        <P className="text-text-secondary">
          Already have an account?{' '}
          <Link 
            href="/login"
            className="font-medium text-primary hover:text-primary-hover transition-colors underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </P>
      </div>
    </div>
  );
}