import Board from '../../models/Board';
import Task from '../../models/Task';
import  { Types } from 'mongoose';

export const deleteTaskService = async (taskId: string): Promise<{ boardId: string, columnId: string } | null> => {
    const board = await Board.findOne({ "columns.tasks": taskId });
    if (!board) return null;

    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) return null;

    let columnId = '';
    board.columns.forEach(column => {
        const taskIndex = column.tasks.indexOf(deletedTask._id);
        if(taskIndex > -1) {
            columnId = column._id.toString();
            column.tasks.splice(taskIndex, 1);
        }
    });
    await board.save();

    if (!columnId) throw new Error('Task reference not found in any column');

    return { boardId: (board._id as Types.ObjectId).toString(), columnId };
};