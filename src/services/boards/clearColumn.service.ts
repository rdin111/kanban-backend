import Board from '../../models/Board';
import Task from '../../models/Task';

export const clearColumnService = async (boardId: string, columnId: string, userId: string): Promise<void> => {
    const board = await Board.findById(boardId);
    if (!board) throw new Error('Board not found');
    if (board.user.toString() !== userId) throw new Error('Unauthorized');

    const column = board.columns.find(c => c._id.toString() === columnId);
    if (!column) throw new Error('Column not found');

    // Delete all tasks that are in this column's tasks array
    if (column.tasks.length > 0) {
        await Task.deleteMany({ _id: { $in: column.tasks } });
    }

    // Clear the tasks array in the board document
    column.tasks = [];
    await board.save();
};