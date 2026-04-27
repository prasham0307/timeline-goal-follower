import express, { Response } from 'express';
import prisma from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createGoalSchema } from '../validators/schemas';
import {
  generateTimeline,
  expandRecurringTasks,
  calculateProgress,
  validateGoalDuration,
  DefaultTask,
} from '../services/timeline';
import { startOfDay, parseISO } from 'date-fns';

const router = express.Router();

// GET /api/goals - List user's goals
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      include: {
        tasks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get today's date range
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Calculate progress for each goal (TODAY's tasks only)
    const goalsWithProgress = goals.map((goal) => {
      // Filter tasks to only include today's tasks
      const todaysTasks = goal.tasks.filter((task: any) => {
        if (!task.date) return false;
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate <= endOfToday;
      });
      
      const progress = calculateProgress(todaysTasks);
      return {
        ...goal,
        progress,
      };
    });

    res.json({ goals: goalsWithProgress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /api/goals/today - Get today's tasks across all goals
router.get('/today', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    // Get the current date/time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const goals = await prisma.goal.findMany({
      where: { 
        userId: req.userId,
      },
      include: {
        tasks: true, // Get ALL tasks, not just today's
      },
    });

    // Filter goals that are active today (client-side filtering for better debugging)
    const activeGoals = goals.filter((goal: any) => {
      const start = new Date(goal.startDate);
      const end = new Date(goal.deadline);
      return start <= endOfToday && end >= today;
    });

    // Collect all tasks including default tasks from active goals
    const allTasks: any[] = [];

    activeGoals.forEach((goal: any) => {
      
      // Add specific tasks for TODAY only
      goal.tasks.forEach((task: any) => {
        if (task.date) {
          const taskDate = new Date(task.date);
          if (taskDate >= today && taskDate <= endOfToday) {
            allTasks.push({
              ...task,
              goalId: goal.id,
              goalTitle: goal.title,
              isDefault: false,
            });
          }
        }
      });

      // Add default tasks if they apply today
      const defaultTasks = JSON.parse(goal.defaultTasks || '[]');
      
      defaultTasks.forEach((defaultTask: any, index: number) => {
        // Only include recurring tasks that apply today
        let shouldShow = false;
        
        if (defaultTask.isRecurring && defaultTask.recurrence) {
          const recurrence = defaultTask.recurrence.toLowerCase();
          const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()];
          
          if (recurrence === 'daily') {
            shouldShow = true;
          } else if (recurrence.includes(dayOfWeek)) {
            shouldShow = true;
          }
        }

        if (shouldShow) {
          // Check if there's already a specific task created for this default task (check ALL tasks, not just today)
          const hasSpecificTask = goal.tasks.some((t: any) => {
            if (t.title !== defaultTask.title) return false;
            // Check if task is for today
            if (t.date) {
              const taskDate = new Date(t.date);
              return taskDate >= today && taskDate <= endOfToday;
            }
            return false;
          });

          if (!hasSpecificTask) {
            allTasks.push({
              id: `default-${goal.id}-${index}`,
              title: defaultTask.title,
              notes: defaultTask.notes,
              completed: false,
              isRecurring: defaultTask.isRecurring,
              recurrence: defaultTask.recurrence,
              date: todayStr,
              goalId: goal.id,
              goalTitle: goal.title,
              isDefault: true,
            });
          }
        }
      });
    });

    res.json({ tasks: allTasks, date: todayStr });
  } catch (error) {
    console.error('Error fetching today tasks:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s tasks' });
  }
});

// POST /api/goals - Create a goal
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createGoalSchema.parse(req.body);

    // Validate duration
    const durationCheck = validateGoalDuration(validatedData.startDate, validatedData.deadline);
    
    if (!durationCheck.isValid) {
      res.status(400).json({ error: durationCheck.warning });
      return;
    }

    // Get default tasks from template if provided
    let defaultTasks: DefaultTask[] = validatedData.defaultTasks || [];
    
    if (validatedData.template && !defaultTasks.length) {
      const template = await prisma.template.findUnique({
        where: { name: validatedData.template },
      });
      
      if (template) {
        defaultTasks = JSON.parse(template.defaultTasks);
      }
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!,
        title: validatedData.title,
        description: validatedData.description,
        startDate: new Date(validatedData.startDate),
        deadline: new Date(validatedData.deadline),
        template: validatedData.template,
        defaultTasks: JSON.stringify(defaultTasks),
      },
      include: {
        tasks: true,
      },
    });

    res.status(201).json({
      goal,
      warning: durationCheck.warning,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// GET /api/goals/:goalId - Get goal details with timeline
router.get('/:goalId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.userId,
      },
      include: {
        tasks: true,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Parse default tasks
    const defaultTasks: DefaultTask[] = JSON.parse(goal.defaultTasks);

    // Generate timeline preview (first 30 days or all if less)
    const timeline = generateTimeline(
      goal.startDate.toISOString(),
      goal.deadline.toISOString(),
      defaultTasks
    );

    // Expand recurring tasks
    const tasksByDate = expandRecurringTasks(
      goal.tasks,
      goal.startDate,
      goal.deadline
    );

    // Calculate progress
    const progress = calculateProgress(goal.tasks);

    res.json({
      goal: {
        ...goal,
        defaultTasks,
      },
      timeline: timeline.slice(0, 30), // Preview first 30 days
      totalDays: timeline.length,
      tasksByDate: Object.fromEntries(tasksByDate),
      progress,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// POST /api/goals/:goalId/generate-timeline - Generate/regenerate timeline
router.post('/:goalId/generate-timeline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.userId,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const defaultTasks: DefaultTask[] = JSON.parse(goal.defaultTasks);
    const timeline = generateTimeline(
      goal.startDate.toISOString(),
      goal.deadline.toISOString(),
      defaultTasks
    );

    res.json({
      timeline,
      totalDays: timeline.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate timeline' });
  }
});

// GET /api/goals/:goalId/days/:date - Get tasks for a specific day
router.get('/:goalId/days/:date', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId, date } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.userId,
      },
      include: {
        tasks: true,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Parse target date
    const targetDate = startOfDay(parseISO(date));

    // Get default tasks
    const defaultTasks: DefaultTask[] = JSON.parse(goal.defaultTasks);

    // Filter tasks for this specific date
    const tasksForDay = goal.tasks.filter((task) => {
      if (!task.isRecurring && task.date) {
        return startOfDay(task.date).getTime() === targetDate.getTime();
      }
      
      if (task.isRecurring) {
        // Check if recurring task applies to this date
        const recurrence = task.recurrence?.toLowerCase() || 'daily';
        
        if (recurrence === 'daily') {
          return true;
        }
        
        if (recurrence.includes(',')) {
          const dayMap: { [key: string]: number } = {
            sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
          };
          const days = recurrence.split(',').map((d) => d.trim().toLowerCase());
          return days.some((day) => dayMap[day] === targetDate.getDay());
        }
      }
      
      return false;
    });

    // Calculate day progress
    const totalTasks = defaultTasks.length + tasksForDay.length;
    const completedTasks = tasksForDay.filter((t) => t.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      date: targetDate.toISOString(),
      defaultTasks,
      tasks: tasksForDay,
      progress: {
        percentage: progress,
        completed: completedTasks,
        total: totalTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch day details' });
  }
});

// POST /api/goals/:goalId/tasks - Create a task for a goal
router.post('/:goalId/tasks', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.userId,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { title, notes, date, isRecurring, recurrence, completed } = req.body;

    const task = await prisma.task.create({
      data: {
        goalId,
        userId: req.userId!,
        title,
        notes,
        date: date ? new Date(date) : null,
        isRecurring: isRecurring || false,
        recurrence,
        completed: completed || false,
      },
    });

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/goals/:goalId - Update a goal
router.patch('/:goalId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.userId,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const { title, description, startDate, deadline, template } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (template !== undefined) {
      updateData.template = template;
      // If template is changed, fetch and apply new default tasks
      if (template) {
        const templateData = await prisma.template.findUnique({
          where: { name: template },
        });
        if (templateData) {
          updateData.defaultTasks = templateData.defaultTasks;
        }
      }
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
      include: { tasks: true },
    });

    res.json({ goal: updatedGoal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:goalId - Delete a goal
router.delete('/:goalId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { goalId } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.userId,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
