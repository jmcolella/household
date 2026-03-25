export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  time: string; // HH:mm format
  dayOfWeek?: number; // 0-6 (0 = Sunday)
  dayOfMonth?: number; // 1-31
}

export interface ParsedCron {
  frequency: RecurrenceFrequency;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

/**
 * Convert user-friendly config to cron expression
 * Format: minute hour day month weekday
 */
export function generateCronExpression(config: RecurrenceConfig): string {
  const [hours, minutes] = config.time.split(':');

  switch (config.frequency) {
    case 'DAILY':
      return `${minutes} ${hours} * * *`;
    case 'WEEKLY':
      if (config.dayOfWeek === undefined) {
        throw new Error('dayOfWeek is required for weekly frequency');
      }
      return `${minutes} ${hours} * * ${config.dayOfWeek}`;
    case 'MONTHLY':
      if (config.dayOfMonth === undefined) {
        throw new Error('dayOfMonth is required for monthly frequency');
      }
      return `${minutes} ${hours} ${config.dayOfMonth} * *`;
  }
}

/**
 * Parse cron expression back to user-friendly config
 * Returns null if cron cannot be parsed
 */
export function parseCronExpression(cron: string): ParsedCron | null {
  const parts = cron.trim().split(/\s+/);

  if (parts.length !== 5) {
    return null;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Parse time
  const time = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

  // Determine frequency
  if (dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
    // Monthly
    return {
      frequency: 'MONTHLY',
      time,
      dayOfMonth: parseInt(dayOfMonth),
    };
  } else if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    // Weekly
    return {
      frequency: 'WEEKLY',
      time,
      dayOfWeek: parseInt(dayOfWeek),
    };
  } else if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    // Daily
    return {
      frequency: 'DAILY',
      time,
    };
  }

  return null;
}

/**
 * Generate human-readable description from config
 */
export function getCronDescription(config: RecurrenceConfig): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Parse time to 12-hour format
  const [hours, minutes] = config.time.split(':');
  const hour = parseInt(hours);
  const isPM = hour >= 12;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const timeFormatted = `${hour12}:${minutes} ${isPM ? 'PM' : 'AM'}`;

  switch (config.frequency) {
    case 'DAILY':
      return `Every day at ${timeFormatted}`;
    case 'WEEKLY':
      if (config.dayOfWeek === undefined) {
        return 'Weekly (incomplete configuration)';
      }
      return `Every ${dayNames[config.dayOfWeek]} at ${timeFormatted}`;
    case 'MONTHLY':
      if (config.dayOfMonth === undefined) {
        return 'Monthly (incomplete configuration)';
      }
      const suffix = getDaySuffix(config.dayOfMonth);
      return `Monthly on the ${config.dayOfMonth}${suffix} at ${timeFormatted}`;
  }
}

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
