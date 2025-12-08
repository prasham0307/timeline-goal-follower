import { eachDayOfInterval, startOfDay, parseISO, format } from 'date-fns';

export interface DefaultTask {
  title: string;
  isRecurring?: boolean;
  recurrence?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  completed: boolean;
  date: Date | null;
  isRecurring: boolean;
  recurrence?: string | null;
}

export interface Day {
  date: string; // ISO date string at midnight
  defaultTasks: DefaultTask[];
  tasks: Task[];
}

/**
 * Generate timeline of days between start and end dates (inclusive)
 * with default tasks attached to each day
 */
export function generateTimeline(
  startIso: string,
  endIso: string,
  defaultTasks: DefaultTask[]
): Day[] {
  const startDate = startOfDay(parseISO(startIso));
  const endDate = startOfDay(parseISO(endIso));

  // Validate dates
  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date');
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => ({
    date: day.toISOString(),
    defaultTasks,
    tasks: [],
  }));
}

/**
 * Check if a task should appear on a given date based on recurrence rules
 */
export function shouldTaskAppearOnDate(
  task: { isRecurring: boolean; recurrence?: string | null; date?: Date | null },
  targetDate: Date
): boolean {
  if (!task.isRecurring) {
    // Non-recurring tasks only appear on their specific date
    if (!task.date) return false;
    return startOfDay(task.date).getTime() === startOfDay(targetDate).getTime();
  }

  // Recurring tasks
  const recurrence = task.recurrence?.toLowerCase() || 'daily';

  if (recurrence === 'daily') {
    return true;
  }

  // Handle day-of-week recurrence (e.g., "mon,wed,fri")
  if (recurrence.includes(',')) {
    const dayMap: { [key: string]: number } = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };

    const days = recurrence.split(',').map((d) => d.trim().toLowerCase());
    const targetDayOfWeek = targetDate.getDay();

    return days.some((day) => dayMap[day] === targetDayOfWeek);
  }

  // Default to daily for unrecognized patterns
  return true;
}

/**
 * Expand recurring tasks across a date range
 * Returns an array of task instances for each day
 */
export function expandRecurringTasks(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): Map<string, Task[]> {
  const tasksByDate = new Map<string, Task[]>();
  const days = eachDayOfInterval({ start: startOfDay(startDate), end: startOfDay(endDate) });

  days.forEach((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const tasksForDay: Task[] = [];

    tasks.forEach((task) => {
      if (shouldTaskAppearOnDate(task, day)) {
        tasksForDay.push(task);
      }
    });

    tasksByDate.set(dateKey, tasksForDay);
  });

  return tasksByDate;
}

/**
 * Calculate progress for a goal
 * Returns percentage completed and task counts
 */
export function calculateProgress(tasks: Task[]): {
  percentage: number;
  completed: number;
  total: number;
} {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { percentage, completed, total };
}

/**
 * Calculate progress for a specific date
 */
export function calculateDayProgress(
  defaultTasks: DefaultTask[],
  specificTasks: Task[]
): {
  percentage: number;
  completed: number;
  total: number;
} {
  const total = defaultTasks.length + specificTasks.length;
  const completed = specificTasks.filter((task) => task.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { percentage, completed, total };
}

/**
 * Get days count and warn if too long
 */
export function validateGoalDuration(startIso: string, endIso: string): {
  isValid: boolean;
  daysCount: number;
  warning?: string;
} {
  const startDate = startOfDay(parseISO(startIso));
  const endDate = startOfDay(parseISO(endIso));

  if (startDate > endDate) {
    return {
      isValid: false,
      daysCount: 0,
      warning: 'Start date must be before or equal to end date',
    };
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const daysCount = days.length;

  if (daysCount > 365) {
    return {
      isValid: true,
      daysCount,
      warning: 'Goal duration exceeds 365 days. Consider breaking it into smaller goals.',
    };
  }

  return {
    isValid: true,
    daysCount,
  };
}
