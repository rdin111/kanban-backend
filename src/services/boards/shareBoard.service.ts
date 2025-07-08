import Board, { IBoard } from '../../models/Board';
import crypto from 'crypto';

export const shareBoardService = async (boardId: string, userId: string): Promise<IBoard> => {
    const board = await Board.findById(boardId);

    if (!board) {
        throw new Error('Board not found');
    }
    if (board.user.toString() !== userId) {
        // Only the owner can share the board
        throw new Error('Unauthorized');
    }

    // Generate a unique public ID if it doesn't exist
    if (!board.publicId) {
        board.publicId = crypto.randomBytes(12).toString('hex');
    }

    board.isPublic = true;
    await board.save();
    return board;
};