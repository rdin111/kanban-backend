import Board, { IBoard } from '../../models/Board';

export const getPublicBoardService = async (publicId: string): Promise<IBoard | null> => {
    // Find a board by its publicId, ensure it's set to public, and populate its tasks
    const board = await Board.findOne({ publicId: publicId, isPublic: true })
        .populate({
            path: 'columns.tasks',
            model: 'Task',
        });

    return board;
};