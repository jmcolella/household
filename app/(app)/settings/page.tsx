'use client';

import { useGetUser } from '@/app/client/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { BottomNav } from '@/components/bottom-nav';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: user, isLoading } = useGetUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/login');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSignOut} variant="destructive" className="w-full">
          Sign Out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
