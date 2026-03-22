import { pgTable, serial, varchar, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import type { TaskExecutionStatus, ReminderStatus } from '@/app/types/enums';

export const households = pgTable('households', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  householdId: integer('household_id').references(() => households.id, { onDelete: 'cascade' }).notNull(),
  supabaseUserId: varchar('supabase_user_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  householdIdIdx: index('idx_users_household_id').on(table.householdId),
  supabaseUserIdIdx: index('idx_users_supabase_user_id').on(table.supabaseUserId),
}));

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  householdId: integer('household_id').references(() => households.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'restrict' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  householdIdIdx: index('idx_tasks_household_id').on(table.householdId),
}));

export const taskExecutions = pgTable('task_executions', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 50 }).notNull().$type<TaskExecutionStatus>(),
  assignee: integer('assignee').references(() => users.id, { onDelete: 'set null' }),
  completedAt: timestamp('completed_at'),
  completedBy: integer('completed_by').references(() => users.id, { onDelete: 'set null' }),
  completionNotes: text('completion_notes'),
  expectedCompletedAt: timestamp('expected_completed_at').notNull(),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  taskIdIdx: index('idx_task_executions_task_id').on(table.taskId),
  statusIdx: index('idx_task_executions_status').on(table.status),
  expectedCompletedAtIdx: index('idx_task_executions_expected_completed_at').on(table.expectedCompletedAt),
  assigneeIdx: index('idx_task_executions_assignee').on(table.assignee),
}));

export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().$type<ReminderStatus>(),
  lastExecutionCreatedAt: timestamp('last_execution_created_at'),
  nextTriggerAt: timestamp('next_trigger_at'),
  pausedAt: timestamp('paused_at'),
  resumeAt: timestamp('resume_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('idx_reminders_status').on(table.status),
  nextTriggerAtIdx: index('idx_reminders_next_trigger_at').on(table.nextTriggerAt),
}));

export const reminderSchedules = pgTable('reminder_schedules', {
  id: serial('id').primaryKey(),
  creationOrderId: integer('creation_order_id').notNull(),
  reminderId: integer('reminder_id').references(() => reminders.id, { onDelete: 'cascade' }).notNull(),
  schedule: varchar('schedule', { length: 255 }).notNull(),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  reminderIdIdx: index('idx_reminder_schedules_reminder_id').on(table.reminderId),
}));
