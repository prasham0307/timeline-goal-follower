import express, { Response } from 'express';
import prisma from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { updateTaskSchema } from '../validators/schemas';

const router = express.Router();

// PATCH /api/tasks/:taskId - Update task (toggle complete, edit details)
router.patch('/:taskId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.userId,
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const validatedData = updateTaskSchema.parse(req.body);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
        ...(validatedData.completed !== undefined && { completed: validatedData.completed }),
        ...(validatedData.date !== undefined && { date: new Date(validatedData.date) }),
        ...(validatedData.isRecurring !== undefined && { isRecurring: validatedData.isRecurring }),
        ...(validatedData.recurrence !== undefined && { recurrence: validatedData.recurrence }),
      },
    });

    res.json({ task: updatedTask });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:taskId - Delete a task
router.delete('/:taskId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    // Verify task belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: req.userId,
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
