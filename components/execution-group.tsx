'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskExecutionCard } from '@/components/task-execution-card';
import type { TaskExecutionResponse } from '@/app/api/task-executions/types';

interface ExecutionGroupProps {
  title: string;
  count: number;
  executions: TaskExecutionResponse[];
  defaultOpen?: boolean;
  variant?: 'default' | 'destructive' | 'secondary';
}

export function ExecutionGroup({
  title,
  count,
  executions,
  defaultOpen = false,
  variant = 'default',
}: ExecutionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  const titleColorClass =
    variant === 'destructive'
      ? 'text-destructive'
      : variant === 'secondary'
      ? 'text-muted-foreground'
      : 'text-foreground';

  return (
    <section className="mb-6">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-0 h-auto mb-3 hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          <h2 className={`text-xl font-semibold ${titleColorClass}`}>
            {title} ({count})
          </h2>
        </div>
      </Button>

      {isOpen && (
        <div className="space-y-3">
          {executions.map((execution) => (
            <TaskExecutionCard key={execution.id} execution={execution} />
          ))}
        </div>
      )}
    </section>
  );
}
