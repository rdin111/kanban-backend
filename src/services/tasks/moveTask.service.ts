import Board from '../../models/Board';
import mongoose, { Types } from 'mongoose';

export const moveTaskService = async (
    taskId: string,
    sourceColumnId: string,
    destColumnId: string,
    destIndex: number
): Promise<{ boardId: string }> => {
    // Start a new session for the transaction
    const session = await mongoose.startSession();
    let boardId = '';

    try {
        // Start the transaction
        await session.withTransaction(async () => {
            // All database operations inside this block are part of the transaction
            const board = await Board.findOne({ 'columns._id': sourceColumnId }).session(session);

            if (!board) {
                throw new Error('Board not found');
            }

            // Set boardId for the return value
            boardId = (board._id as Types.ObjectId).toString();

            const sourceColumn = board.columns.find(
                (c) => c._id.toString() === sourceColumnId
            );
            const destColumn = board.columns.find(
                (c) => c._id.toString() === destColumnId
            );

            if (!sourceColumn || !destColumn) {
                throw new Error('Source or destination column not found');
            }

            const taskObjectId = new Types.ObjectId(taskId);
            const taskIndex = sourceColumn.tasks.indexOf(taskObjectId);

            if (taskIndex > -1) {
                // Remove task ID from the source column's tasks array
                sourceColumn.tasks.splice(taskIndex, 1);
            } else {
                throw new Error('Task not found in source column');
            }

            // Add task ID to the destination column's tasks array at the correct position
            destColumn.tasks.splice(destIndex, 0, taskObjectId);

            // Save the changes to the board within the transaction
            await board.save({ session });
        });
    } finally {
        // End the session after the transaction is complete
        await session.endSession();
    }

    // If the transaction was successful, return the boardId
    if (!boardId) {
        throw new Error('Transaction failed and boardId was not set.');
    }

    return { boardId };
};