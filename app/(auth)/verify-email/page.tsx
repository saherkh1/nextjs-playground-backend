'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

function VerifyEmailContent() {
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setState('invalid');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const response = await api.auth.verifyEmail(token);
        
        if (response.success) {
          setState('success');
          setMessage(response.data || 'Your email has been verified successfully! You can now sign in to your account.');
        } else {
          setState('error');
          setMessage('Email verification failed. The link may be expired or invalid.');
        }
      } catch (err: any) {
        setState('error');
        // Try to extract error message from API response
        const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Email verification failed. Please try again or contact support.';
        setMessage(errorMessage);
        console.error('Email verification error:', err);
      }
    };

    verifyEmail();
  }, [token]);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      setResendMessage('');
      
      const response = await api.auth.resendVerification(resendEmail.trim());
      
      if (response.success) {
        setResendMessage(response.data || 'Verification email sent successfully!');
      } else {
        setResendMessage((response as any).error || 'Failed to send verification email');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Failed to send verification email. Please try again.';
      setResendMessage(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Verifying your email</h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        );

      case 'success':
        return (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Email verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </>
        );

      case 'error':
      case 'expired':
      case 'invalid':
        return (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Verification failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
          </>
        );
    }
  };

  const renderActions = () => {
    switch (state) {
      case 'success':
        return (
          <div className="space-y-4">
            <Link href="/login">
              <Button className="w-full">
                Sign in to your account
              </Button>
            </Link>
          </div>
        );

      case 'error':
      case 'expired':
      case 'invalid':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="resendEmail" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="resendEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isResending}
                />
              </div>
              
              {resendMessage && (
                <div className={`text-sm p-3 rounded-md ${
                  resendMessage.includes('sent') || resendMessage.includes('success') 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {resendMessage}
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending || !resendEmail.trim()}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <Link 
                href="/register"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Create a new account
              </Link>
              <span className="mx-2 text-gray-400">•</span>
              <Link 
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        );

      case 'loading':
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        {renderContent()}
      </div>

      {state !== 'loading' && (
        <div className="text-center">
          {renderActions()}
        </div>
      )}

      {state !== 'loading' && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a 
              href="mailto:support@photoflow.app"
              className="text-blue-600 hover:text-blue-500"
            >
              Contact support
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Loading...</h2>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}