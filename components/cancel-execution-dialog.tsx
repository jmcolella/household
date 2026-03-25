'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCancelExecution } from '@/app/client/hooks/use-task-executions';
import { toast } from 'sonner';

interface CancelExecutionDialogProps {
  executionId: number;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelExecutionDialog({
  executionId,
  taskTitle,
  open,
  onOpenChange,
}: CancelExecutionDialogProps) {
  const [reason, setReason] = useState('');
  const cancelExecution = useCancelExecution();

  const handleCancel = async () => {
    try {
      await cancelExecution.mutateAsync({
        executionId,
        reason: reason.trim() || undefined,
      });

      toast.success('Task cancelled', {
        description: `"${taskTitle}" has been cancelled.`,
      });

      onOpenChange(false);
      setReason('');
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to cancel task',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel &quot;{taskTitle}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (optional)</Label>
          <Textarea
            id="reason"
            placeholder="Why are you cancelling this task?"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelExecution.isPending}
          >
            Keep Open
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelExecution.isPending}
          >
            {cancelExecution.isPending ? 'Cancelling...' : 'Cancel Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
