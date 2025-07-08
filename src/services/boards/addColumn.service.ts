import Board from '../../models/Board';
import { IColumn } from '../../models/Board';

export const addColumnService = async (
    boardId: string,
    columnName: string,
    userId: string
): Promise<IColumn> => {
    const board = await Board.findById(boardId);
    if (!board) throw new Error('Board not found');
    if (board.user.toString() !== userId) throw new Error('Unauthorized');

    // Create a plain object that matches the shape of the subdocument schema.
    const newColumnObject = {
        name: columnName,
        tasks: [],
    };

    // Push the plain object directly into the DocumentArray.
    // Mongoose will handle creating the full subdocument with its _id.
    board.columns.push(newColumnObject);

    await board.save();

    // The newly created subdocument is the last one in the array.
    return board.columns[board.columns.length - 1];
};