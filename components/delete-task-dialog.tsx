'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteTask } from '@/app/client/hooks/use-tasks';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteTaskDialogProps {
  taskId: number;
  taskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteTaskDialog({
  taskId,
  taskTitle,
  open,
  onOpenChange,
  onDeleted,
}: DeleteTaskDialogProps) {
  const deleteTask = useDeleteTask();

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(taskId);

      toast.success('Task deleted', {
        description: `"${taskTitle}" and all its executions have been deleted.`,
      });

      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete task',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Task
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{taskTitle}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-destructive/10 border border-destructive p-3">
          <p className="text-sm text-destructive">
            <strong>Warning:</strong> This will permanently delete the task and all its execution
            history. This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteTask.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
          >
            {deleteTask.isPending ? 'Deleting...' : 'Delete Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
