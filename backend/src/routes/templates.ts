import express, { Response } from 'express';
import prisma from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  defaultTasks: z.array(z.object({
    title: z.string(),
    notes: z.string().optional(),
    isRecurring: z.boolean(),
    recurrence: z.string().optional(),
  })),
});

const updateTemplateSchema = z.object({
  description: z.string().optional(),
  category: z.string().optional(),
  defaultTasks: z.array(z.object({
    title: z.string(),
    notes: z.string().optional(),
    isRecurring: z.boolean(),
    recurrence: z.string().optional(),
  })).optional(),
});

// GET /api/templates - List all templates
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    const templatesWithParsed = templates.map((template) => ({
      ...template,
      defaultTasks: JSON.parse(template.defaultTasks),
    }));

    res.json({ templates: templatesWithParsed });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:name - Get a specific template
router.get('/:name', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;

    const template = await prisma.template.findUnique({
      where: { name },
    });

    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    res.json({
      template: {
        ...template,
        defaultTasks: JSON.parse(template.defaultTasks),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /api/templates - Create a new template
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTemplateSchema.parse(req.body);

    const template = await prisma.template.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        defaultTasks: JSON.stringify(validatedData.defaultTasks),
      },
    });

    res.status(201).json({
      template: {
        ...template,
        defaultTasks: JSON.parse(template.defaultTasks),
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Template with this name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /api/templates/:name - Update a template
router.put('/:name', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;
    const validatedData = updateTemplateSchema.parse(req.body);

    const updateData: any = {};
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.category !== undefined) {
      updateData.category = validatedData.category;
    }
    if (validatedData.defaultTasks !== undefined) {
      updateData.defaultTasks = JSON.stringify(validatedData.defaultTasks);
    }

    const template = await prisma.template.update({
      where: { name },
      data: updateData,
    });

    // If defaultTasks were updated, sync to all goals using this template
    if (validatedData.defaultTasks !== undefined) {
      await prisma.goal.updateMany({
        where: { template: name },
        data: { defaultTasks: JSON.stringify(validatedData.defaultTasks) },
      });
    }

    res.json({
      template: {
        ...template,
        defaultTasks: JSON.parse(template.defaultTasks),
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:name - Delete a template
router.delete('/:name', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.params;

    await prisma.template.delete({
      where: { name },
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
