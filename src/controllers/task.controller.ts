import { Request, Response, NextFunction } from 'express';
import { createTask, listTasks } from '../services/task.service';

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await createTask(req.body);
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function listTasksHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await listTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}
