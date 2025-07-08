import Board, { IBoard } from '../models/Board';

// The new return type for the paginated result
export interface PaginatedBoardsResult {
    boards: IBoard[];
    total: number;
    page: number;
    limit: number;
}

// Service to get all boards for a specific user with pagination
export const getBoardsService = async (
    userId: string,
    page: number,
    limit: number
): Promise<PaginatedBoardsResult> => {
    const skip = (page - 1) * limit;

    // Execute two queries in parallel for efficiency
    const [boards, total] = await Promise.all([
        Board.find({ user: userId })
            .limit(limit)
            .skip(skip)
            .populate({
                path: 'columns.tasks',
                model: 'Task',
            })
            .sort({ createdAt: -1 }), // Sort by most recent
        Board.countDocuments({ user: userId }),
    ]);

    return { boards, total, page, limit };
};

// Service to get a single board by ID
export const getBoardByIdService = async (boardId: string): Promise<IBoard | null> => {
    return Board.findById(boardId).populate({
        path: 'columns.tasks',
        model: 'Task',
    });
};

// Service to create a new board
export const createBoardService = async (name: string, userId: string): Promise<IBoard> => {
    const newBoard = new Board({
        name,
        user: userId,
        columns: [
            { name: 'To Do', tasks: [] },
            { name: 'In Progress', tasks: [] },
            { name: 'Done', tasks: [] },
        ],
    });
    return newBoard.save();
};

// Service to update a board's name
export const updateBoardService = async (
    boardId: string,
    name: string
): Promise<IBoard | null> => {
    return Board.findByIdAndUpdate(boardId, { name }, { new: true });
};