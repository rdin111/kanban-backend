import Board from '../../models/Board';
import Task, { ITask } from '../../models/Task';
import { Types } from 'mongoose';

export const updateTaskService = async (
    taskId: string,
    updateData: { title?: string; description?: string }
): Promise<{ updatedTask: ITask, boardId: string } | null> => {
    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    if (!updatedTask) return null;

    const board = await Board.findOne({ "columns.tasks": taskId });
    if (!board) throw new Error('Parent board not found for updated task');

    return { updatedTask, boardId: (board._id as Types.ObjectId).toString() };
};