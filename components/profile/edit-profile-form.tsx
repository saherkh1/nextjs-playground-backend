'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UpdateUserRequest } from '@/lib/types';
import { updateUserSchema, UpdateUserFormData } from '@/lib/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface EditProfileFormProps {
  user: User;
  onUpdateSuccess: (updatedUser: User) => void;
}

export function EditProfileForm({ user, onUpdateSuccess }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = form;

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const updateData: UpdateUserRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await api.users.updateMe(updateData);

      if (response.success) {
        setSuccess(true);
        onUpdateSuccess(response.data);
        // Reset form with new values
        reset({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err: any) {
      // Handle API errors - currently backend returns 500 errors
      let errorMessage = 'Failed to update profile';
      
      if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Note: Backend currently returns 500 errors for profile endpoints
      if (errorMessage === 'Request failed with status code 500') {
        errorMessage = 'Profile update temporarily unavailable. Backend endpoint needs debugging.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">Profile updated successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                {...register('firstName')}
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                disabled={isSubmitting}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                {...register('lastName')}
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                disabled={isSubmitting}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}