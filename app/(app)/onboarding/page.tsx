'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingForm, type OnboardingFormData } from '@/app/(app)/onboarding/use-onboarding-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ApiResponse } from '@/app/api/types';

export default function OnboardingPage() {
  const router = useRouter();
  const form = useOnboardingForm();

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const res = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.householdName,
          username: data.username,
        }),
      });

      const result: ApiResponse<unknown> = await res.json();

      if (result.error) {
        form.setError('root', {
          type: 'manual',
          message: result.error
        });
        return;
      }

      // Redirect to dashboard
      router.push('/dashboard');
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Household!</CardTitle>
          <p className="text-center text-muted-foreground mt-2">
            Let&apos;s set up your household
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="rounded-md bg-error/10 border border-error p-3">
                  <p className="text-sm text-error">{form.formState.errors.root.message}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Username</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="householdName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="The Smith Family" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create Household'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
