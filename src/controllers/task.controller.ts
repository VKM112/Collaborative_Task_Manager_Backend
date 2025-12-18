import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/errors';
import { createTask, deleteTask, getTaskById, listTasks, updateTask } from '../services/task.service';
import { ensureTeamMembership } from '../services/team.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export async function createTaskHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { teamId } = req.body;
    if (!userId) {
      throw new ApiError(401, 'Missing user context.');
    }
    if (!teamId || typeof teamId !== 'string') {
      throw new ApiError(400, 'Team id is required when creating a task.');
    }

    await ensureTeamMembership(userId, teamId);

    const task = await createTask({
      ...req.body,
      creatorId: userId,
      teamId,
    });
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function listTasksHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { status, priority, assignedToId, creatorId, sortBy, overdue, teamId } = req.query;
    const parsedOverdue = overdue === 'true';
    if (!teamId || typeof teamId !== 'string') {
      throw new ApiError(400, 'Team id is required to fetch tasks.');
    }
    if (!userId) {
      throw new ApiError(401, 'Missing user context.');
    }

    await ensureTeamMembership(userId, teamId);

    const tasks = await listTasks({
      teamId,
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

export async function updateTaskHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Missing user context.');
    }

    const { id } = req.params;
    const task = await getTaskById(id);
    if (!task) {
      throw new ApiError(404, 'Task not found.');
    }

    await ensureTeamMembership(userId, task.teamId);

    const { teamId, ...body } = req.body;
    const updatedTask = await updateTask(id, body);
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Missing user context.');
    }

    const { id } = req.params;
    const task = await getTaskById(id);
    if (!task) {
      throw new ApiError(404, 'Task not found.');
    }

    await ensureTeamMembership(userId, task.teamId);

    const deleted = await deleteTask(id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
}
