// src/services/boards/deleteColumn.service.ts

import Board from '../../models/Board';
import Task from '../../models/Task';

export const deleteColumnService = async (
    boardId: string,
    columnId: string,
    userId: string
): Promise<void> => {
    const board = await Board.findById(boardId);
    if (!board) {
        throw new Error('Board not found');
    }
    if (board.user.toString() !== userId) {
        throw new Error('Unauthorized');
    }

    // This will now work because TypeScript knows `board.columns` is a DocumentArray
    const column = board.columns.id(columnId);
    if (!column) {
        throw new Error('Column not found');
    }

    // Delete all tasks that belonged to this column
    if (column.tasks.length > 0) {
        await Task.deleteMany({ _id: { $in: column.tasks } });
    }

    // The .pull() method is the correct Mongoose way to remove a subdocument
    board.columns.pull(columnId);

    // Save the parent document
    await board.save();
};