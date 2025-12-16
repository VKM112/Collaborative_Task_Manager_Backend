import { Request, Response, NextFunction } from 'express';
import { createTask, deleteTask, listTasks, updateTask } from '../services/task.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export async function createTaskHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Missing user context' });
    }

    const task = await createTask({
      ...req.body,
      creatorId: userId,
    });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function listTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, priority, assignedToId, creatorId, sortBy, overdue } = req.query;
    const parsedOverdue = overdue === 'true';

    const tasks = await listTasks({
      status: status as string | undefined,
      priority: priority as string | undefined,
      assignedToId: assignedToId as string | undefined,
      creatorId: creatorId as string | undefined,
      sortBy: sortBy === 'createdAt' ? 'createdAt' : 'dueDate',
      overdue: parsedOverdue,
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const task = await updateTask(id, req.body);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const task = await deleteTask(id);
    res.json(task);
  } catch (error) {
    next(error);
  }
}
