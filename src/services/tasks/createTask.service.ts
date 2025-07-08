import Board from '../../models/Board';
import Task, { ITask } from '../../models/Task';

export const createTaskService = async (
    title: string,
    boardId: string,
    columnId: string,
    description?: string
): Promise<{ task: ITask; boardId: string, columnId: string }> => {
    const board = await Board.findById(boardId);
    if (!board) throw new Error('Board not found');

    const column = board.columns.find((c) => c._id.toString() === columnId);
    if (!column) throw new Error('Column not found');

    const newTask = new Task({ title, description });
    await newTask.save();

    column.tasks.push(newTask._id);
    await board.save();

    return { task: newTask, boardId, columnId };
};