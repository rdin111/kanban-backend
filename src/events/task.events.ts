import { getIo } from '../socket';
import { ITask } from '../models/Task';

export const emitTaskCreated = (boardId: string, columnId: string, task: ITask) => {
    getIo().to(boardId).emit('task:created', { task, columnId });
};

export const emitTaskUpdated = (boardId: string, task: ITask) => {
    getIo().to(boardId).emit('task:updated', task);
};

export const emitTaskDeleted = (boardId: string, columnId: string, taskId: string) => {
    getIo().to(boardId).emit('task:deleted', { taskId, columnId });
};

export const emitTaskMoved = (
    boardId: string,
    taskId: string,
    sourceColumnId: string,
    destColumnId: string,
    destIndex: number
) => {
    getIo().to(boardId).emit('task:moved', { taskId, sourceColumnId, destColumnId, destIndex });
};