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
import { useCompleteExecution } from '@/app/client/hooks/use-task-executions';
import { toast } from 'sonner';

interface CompleteExecutionDialogProps {
  executionId: number;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompleteExecutionDialog({
  executionId,
  taskTitle,
  open,
  onOpenChange,
}: CompleteExecutionDialogProps) {
  const [notes, setNotes] = useState('');
  const completeExecution = useCompleteExecution();

  const handleComplete = async () => {
    try {
      await completeExecution.mutateAsync({
        executionId,
        completionNotes: notes.trim() || undefined,
      });

      toast.success('Task completed', {
        description: `"${taskTitle}" has been marked as complete.`,
      });

      onOpenChange(false);
      setNotes('');
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to complete task',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Task</DialogTitle>
          <DialogDescription>
            Mark &quot;{taskTitle}&quot; as complete. You can optionally add notes about the
            completion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="notes">Completion Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about completing this task..."
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={completeExecution.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={completeExecution.isPending}>
            {completeExecution.isPending ? 'Completing...' : 'Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
