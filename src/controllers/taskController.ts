import { Request, Response } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

// Import services from their new individual files
import { createTaskService } from '../services/tasks/createTask.service';
import { updateTaskService } from '../services/tasks/updateTask.service';
import { deleteTaskService } from '../services/tasks/deleteTask.service';
import { moveTaskService } from '../services/tasks/moveTask.service';

import * as TaskEvents from '../events/task.events';

// Zod schemas remain the same...
const createTaskSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    boardId: z.string().refine((val) => isValidObjectId(val)),
    columnId: z.string().refine((val) => isValidObjectId(val)),
});

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
});

const moveTaskSchema = z.object({
    sourceColumnId: z.string().refine((val) => isValidObjectId(val)),
    destColumnId: z.string().refine((val) => isValidObjectId(val)),
    destIndex: z.number().min(0),
});

export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, boardId, columnId } = createTaskSchema.parse(req.body);
        const result = await createTaskService(title, boardId, columnId, description);

        TaskEvents.emitTaskCreated(result.boardId, result.columnId, result.task);

        res.status(201).json(result.task);
    } catch (error) {
        if (error instanceof z.ZodError) res.status(400).json({ message: 'Invalid task data', errors: error.errors });
        else res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;
        if (!isValidObjectId(taskId)) { res.status(400).json({ message: 'Invalid Task ID' }); return; }

        const taskData = updateTaskSchema.parse(req.body);
        const result = await updateTaskService(taskId, taskData);

        if (!result) { res.status(404).json({ message: 'Task not found' }); return; }

        TaskEvents.emitTaskUpdated(result.boardId, result.updatedTask);

        res.status(200).json(result.updatedTask);
    } catch (error) {
        if (error instanceof z.ZodError) res.status(400).json({ message: 'Invalid update data', errors: error.errors });
        else res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;
        if (!isValidObjectId(taskId)) { res.status(400).json({ message: 'Invalid Task ID' }); return; }

        const result = await deleteTaskService(taskId);
        if (!result) { res.status(404).json({ message: 'Task not found' }); return; }

        TaskEvents.emitTaskDeleted(result.boardId, result.columnId, taskId);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

export const moveTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;
        if (!isValidObjectId(taskId)) { res.status(400).json({ message: 'Invalid Task ID' }); return; }

        const { sourceColumnId, destColumnId, destIndex } = moveTaskSchema.parse(req.body);
        const result = await moveTaskService(taskId, sourceColumnId, destColumnId, destIndex);

        TaskEvents.emitTaskMoved(result.boardId, taskId, sourceColumnId, destColumnId, destIndex);

        res.status(200).json({ message: "Task moved successfully" });
    } catch (error) {
        if (error instanceof z.ZodError) res.status(400).json({ message: 'Invalid move data', errors: error.errors });
        else res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};