import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes and underscores'),
  householdName: z
    .string()
    .min(1, 'Household name is required')
    .min(2, 'Household name must be at least 2 characters')
    .max(100, 'Household name must be less than 100 characters'),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function useOnboardingForm() {
  return useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: '',
      householdName: '',
    },
  });
}
