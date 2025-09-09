'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  loginSchema, 
  registerSchema, 
  changePasswordSchema,
  LoginFormData,
  RegisterFormData,
  ChangePasswordFormData 
} from '@/lib/validations';

export const useLoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      
      await login(data.email, data.password);
      
      // Redirect to profile page on successful login
      router.push('/profile');
    } catch (err) {
      // Error is handled by auth context
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    error,
    clearError,
  };
};

export const useRegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, error, clearError } = useAuth();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setIsSuccess(false);
      clearError();
      
      await register(data.firstName, data.lastName, data.email, data.password);
      
      // Show success message
      setIsSuccess(true);
      form.reset();
    } catch (err) {
      // Error is handled by auth context
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    isSuccess,
    error,
    clearError,
  };
};

export const useChangePasswordForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsSubmitting(true);
      setIsSuccess(false);
      setError(null);
      
      const { api } = await import('@/lib/api');
      const response = await api.users.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (response.success) {
        setIsSuccess(true);
        form.reset();
      } else {
        throw new Error('Failed to change password');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    isSuccess,
    error,
    clearError: () => setError(null),
  };
};