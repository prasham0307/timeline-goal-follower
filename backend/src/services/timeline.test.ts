import {
  generateTimeline,
  shouldTaskAppearOnDate,
  expandRecurringTasks,
  calculateProgress,
  validateGoalDuration,
  DefaultTask,
  Task,
} from './timeline';
import { parseISO, startOfDay } from 'date-fns';

describe('Timeline Service', () => {
  describe('generateTimeline', () => {
    it('should generate correct number of days for a date range', () => {
      const defaultTasks: DefaultTask[] = [
        { title: 'Morning cardio', isRecurring: true, recurrence: 'daily' },
      ];

      const timeline = generateTimeline('2025-06-01T00:00:00Z', '2025-06-05T00:00:00Z', defaultTasks);

      expect(timeline).toHaveLength(5);
      expect(timeline[0].date).toBe(startOfDay(parseISO('2025-06-01T00:00:00Z')).toISOString());
      expect(timeline[4].date).toBe(startOfDay(parseISO('2025-06-05T00:00:00Z')).toISOString());
    });

    it('should attach default tasks to each day', () => {
      const defaultTasks: DefaultTask[] = [
        { title: 'Task 1', isRecurring: true, recurrence: 'daily' },
        { title: 'Task 2', isRecurring: true, recurrence: 'daily' },
      ];

      const timeline = generateTimeline('2025-06-01T00:00:00Z', '2025-06-03T00:00:00Z', defaultTasks);

      timeline.forEach((day) => {
        expect(day.defaultTasks).toHaveLength(2);
        expect(day.defaultTasks[0].title).toBe('Task 1');
      });
    });

    it('should throw error if start date is after end date', () => {
      expect(() => {
        generateTimeline('2025-06-10T00:00:00Z', '2025-06-01T00:00:00Z', []);
      }).toThrow('Start date must be before or equal to end date');
    });

    it('should handle single day range', () => {
      const timeline = generateTimeline('2025-06-01T00:00:00Z', '2025-06-01T00:00:00Z', []);
      expect(timeline).toHaveLength(1);
    });

    it('should generate 122 days for 4-month period', () => {
      const timeline = generateTimeline('2025-06-01T00:00:00Z', '2025-09-30T00:00:00Z', []);
      expect(timeline).toHaveLength(122);
    });
  });

  describe('shouldTaskAppearOnDate', () => {
    it('should return true for daily recurring tasks', () => {
      const task = {
        isRecurring: true,
        recurrence: 'daily',
      };

      expect(shouldTaskAppearOnDate(task, new Date('2025-06-01'))).toBe(true);
      expect(shouldTaskAppearOnDate(task, new Date('2025-06-15'))).toBe(true);
    });

    it('should return true for specific day-of-week recurrence', () => {
      const task = {
        isRecurring: true,
        recurrence: 'mon,wed,fri',
      };

      // June 2, 2025 is a Monday
      expect(shouldTaskAppearOnDate(task, new Date('2025-06-02'))).toBe(true);
      // June 3, 2025 is a Tuesday
      expect(shouldTaskAppearOnDate(task, new Date('2025-06-03'))).toBe(false);
      // June 4, 2025 is a Wednesday
      expect(shouldTaskAppearOnDate(task, new Date('2025-06-04'))).toBe(true);
    });

    it('should return true only on specific date for non-recurring tasks', () => {
      const task = {
        isRecurring: false,
        date: new Date('2025-06-10T00:00:00Z'),
      };

      expect(shouldTaskAppearOnDate(task, new Date('2025-06-10'))).toBe(true);
      expect(shouldTaskAppearOnDate(task, new Date('2025-06-11'))).toBe(false);
    });
  });

  describe('expandRecurringTasks', () => {
    it('should expand daily recurring task across date range', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Daily task',
          completed: false,
          date: null,
          isRecurring: true,
          recurrence: 'daily',
        },
      ];

      const tasksByDate = expandRecurringTasks(
        tasks,
        new Date('2025-06-01'),
        new Date('2025-06-03')
      );

      expect(tasksByDate.size).toBe(3);
      expect(tasksByDate.get('2025-06-01')).toHaveLength(1);
      expect(tasksByDate.get('2025-06-02')).toHaveLength(1);
      expect(tasksByDate.get('2025-06-03')).toHaveLength(1);
    });

    it('should place one-off task on specific date only', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'One-off task',
          completed: false,
          date: new Date('2025-06-02T00:00:00Z'),
          isRecurring: false,
        },
      ];

      const tasksByDate = expandRecurringTasks(
        tasks,
        new Date('2025-06-01'),
        new Date('2025-06-03')
      );

      expect(tasksByDate.get('2025-06-01')).toHaveLength(0);
      expect(tasksByDate.get('2025-06-02')).toHaveLength(1);
      expect(tasksByDate.get('2025-06-03')).toHaveLength(0);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate correct percentage for completed tasks', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', completed: true, date: null, isRecurring: false },
        { id: '2', title: 'Task 2', completed: true, date: null, isRecurring: false },
        { id: '3', title: 'Task 3', completed: false, date: null, isRecurring: false },
        { id: '4', title: 'Task 4', completed: false, date: null, isRecurring: false },
      ];

      const progress = calculateProgress(tasks);

      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(2);
      expect(progress.percentage).toBe(50);
    });

    it('should return 0% for no tasks', () => {
      const progress = calculateProgress([]);
      expect(progress.percentage).toBe(0);
      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
    });

    it('should return 100% when all tasks completed', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', completed: true, date: null, isRecurring: false },
        { id: '2', title: 'Task 2', completed: true, date: null, isRecurring: false },
      ];

      const progress = calculateProgress(tasks);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('validateGoalDuration', () => {
    it('should validate correct date range', () => {
      const result = validateGoalDuration('2025-06-01T00:00:00Z', '2025-06-30T00:00:00Z');
      expect(result.isValid).toBe(true);
      expect(result.daysCount).toBe(30);
      expect(result.warning).toBeUndefined();
    });

    it('should return error for invalid date range', () => {
      const result = validateGoalDuration('2025-06-30T00:00:00Z', '2025-06-01T00:00:00Z');
      expect(result.isValid).toBe(false);
      expect(result.warning).toBe('Start date must be before or equal to end date');
    });

    it('should warn for goals longer than 365 days', () => {
      const result = validateGoalDuration('2025-01-01T00:00:00Z', '2026-02-01T00:00:00Z');
      expect(result.isValid).toBe(true);
      expect(result.daysCount).toBeGreaterThan(365);
      expect(result.warning).toContain('exceeds 365 days');
    });
  });
});
