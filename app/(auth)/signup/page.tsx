'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSignupForm, type SignupFormData } from '@/app/(auth)/signup/use-signup-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ApiResponse } from '@/app/api/types';
import type { UserResponse } from '@/app/api/auth/types';

export default function SignupPage() {
  const router = useRouter();
  const form = useSignupForm();

  const onSubmit = async (data: SignupFormData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<UserResponse> = await res.json();

      if (result.error) {
        form.setError('root', {
          type: 'manual',
          message: result.error
        });
        return;
      }

      // Redirect to onboarding to create/join household
      router.push('/onboarding');
      router.refresh();
    } catch {
      form.setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Household</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create your account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            {form.formState.errors.root && (
              <div className="rounded-md bg-error/10 border border-error p-3">
                <p className="text-sm text-error">{form.formState.errors.root.message}</p>
              </div>
            )}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      At least 6 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting ? 'Creating account...' : 'Sign up'}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
