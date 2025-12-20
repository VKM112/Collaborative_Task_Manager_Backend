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

    if (teamId) {
      if (typeof teamId !== 'string') {
        throw new ApiError(400, 'Invalid team id.');
      }
      await ensureTeamMembership(userId, teamId);
    }

    const payload = {
      ...req.body,
      creatorId: userId,
      teamId: teamId ?? undefined,
      assignedToId: teamId ? req.body.assignedToId : userId,
    };

    const task = await createTask(payload);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function listTasksHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { status, priority, assignedToId, creatorId, sortBy, overdue, teamId, scope } = req.query;
    const parsedOverdue = overdue === 'true';
    if (!userId) {
      throw new ApiError(401, 'Missing user context.');
    }

    if (teamId) {
      if (typeof teamId !== 'string') {
        throw new ApiError(400, 'Invalid team id.');
      }
      await ensureTeamMembership(userId, teamId);
    }

    const tasks = await listTasks({
      userId,
      teamId: teamId as string | undefined,
      scope: typeof scope === 'string' ? (scope as 'team' | 'personal' | 'all') : undefined,
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

    const taskTeamId = task.teamId;
    if (taskTeamId) {
      await ensureTeamMembership(userId, taskTeamId);
    } else if (task.creatorId !== userId) {
      throw new ApiError(403, 'You do not have access to this task.');
    }

    const { teamId, ...body } = req.body;
    const normalizedBody = taskTeamId ? body : { ...body, assignedToId: userId };
    const updatedTask = await updateTask(id, normalizedBody);
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

    const taskTeamId = task.teamId;
    if (taskTeamId) {
      await ensureTeamMembership(userId, taskTeamId);
    } else if (task.creatorId !== userId) {
      throw new ApiError(403, 'You do not have access to this task.');
    }

    const deleted = await deleteTask(id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
}
