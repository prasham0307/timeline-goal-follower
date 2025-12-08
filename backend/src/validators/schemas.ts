import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().datetime('Invalid start date'),
  deadline: z.string().datetime('Invalid deadline'),
  template: z.string().optional(),
  defaultTasks: z.array(z.object({
    title: z.string(),
    isRecurring: z.boolean().optional(),
    recurrence: z.string().optional(),
  })).optional(),
});

export const createTaskSchema = z.object({
  goalId: z.string().optional(),
  date: z.string().datetime('Invalid date').optional(),
  title: z.string().min(1, 'Title is required'),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
  date: z.string().datetime().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: z.string().optional(),
});
