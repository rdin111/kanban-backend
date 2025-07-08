import { Request, Response } from 'express';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { IUser } from '../models/User';
import { getIo } from '../socket';
import { addColumnService } from '../services/boards/addColumn.service';
import { deleteColumnService } from '../services/boards/deleteColumn.service';

// Import all board services
import { getBoardsService, getBoardByIdService, createBoardService, updateBoardService } from '../services/board.service';
import { shareBoardService } from '../services/boards/shareBoard.service';
import { getPublicBoardService } from '../services/boards/getPublicBoard.service';
import { clearColumnService } from '../services/boards/clearColumn.service';

const boardNameSchema = z.object({
    name: z.string().min(1, { message: 'Board name is required' }),
});

export const getBoards = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await getBoardsService((req.user as IUser).id, page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

export const getBoardById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId } = req.params;
        if (!isValidObjectId(boardId)) { res.status(400).json({ message: 'Invalid Board ID' }); return; }
        const board = await getBoardByIdService(boardId);
        if (!board || board.user.toString() !== (req.user as IUser).id) {
            res.status(404).json({ message: 'Board not found' }); return;
        }
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

// New controller for getting a public board
export const getPublicBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { publicId } = req.params;
        const board = await getPublicBoardService(publicId);
        if(!board) {
            res.status(404).json({ message: 'Public board not found or sharing is disabled.'}); return;
        }
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

export const createBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = boardNameSchema.parse(req.body);
        const userId = (req.user as IUser).id;
        const savedBoard = await createBoardService(name, userId);
        res.status(201).json(savedBoard);
    } catch (error) {
        if (error instanceof z.ZodError) { res.status(400).json({ message: 'Invalid board data', errors: error.errors }); }
        else { res.status(500).json({ message: 'Server Error', error: (error as Error).message }); }
    }
};

export const updateBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId } = req.params;
        if (!isValidObjectId(boardId)) { res.status(400).json({ message: 'Invalid Board ID' }); return; }
        const board = await getBoardByIdService(boardId);
        if (!board || board.user.toString() !== (req.user as IUser).id) {
            res.status(404).json({ message: 'Board not found' }); return;
        }
        const { name } = boardNameSchema.parse(req.body);
        const updatedBoard = await updateBoardService(boardId, name);
        res.status(200).json(updatedBoard);
    } catch (error) {
        if (error instanceof z.ZodError) { res.status(400).json({ message: 'Invalid board data', errors: error.errors }); }
        else { res.status(500).json({ message: 'Server Error', error: (error as Error).message }); }
    }
};

// New controller for sharing a board
export const shareBoard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId } = req.params;
        if (!isValidObjectId(boardId)) { res.status(400).json({ message: 'Invalid Board ID' }); return; }
        const userId = (req.user as IUser).id;
        const board = await shareBoardService(boardId, userId);
        res.status(200).json({ publicId: board.publicId });
    } catch (error) {
        const err = error as Error;
        if(err.message === 'Unauthorized') {
            res.status(403).json({ message: 'Forbidden: Only the board owner can share.'});
        } else {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
};

export const clearColumn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId, columnId } = req.params;
        const userId = (req.user as IUser).id;

        await clearColumnService(boardId, columnId, userId);

        // We will rely on Socket.IO to inform the client
        res.status(200).json({ message: 'Column cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};

export const addColumn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId } = req.params;
        const { name } = req.body;
        const userId = (req.user as IUser).id;

        if (!name) {
            res.status(400).json({ message: 'Column name is required' });
            return;
        }

        const newColumn = await addColumnService(boardId, name, userId);

        // Emit a socket event to all clients in the board room
        getIo().to(boardId).emit('board:column:created', { newColumn });

        res.status(201).json(newColumn);
    } catch (error) {
        const err = error as Error;
        if(err.message === 'Unauthorized') {
            res.status(403).json({ message: 'Forbidden' });
        } else {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
};

export const deleteColumn = async (req: Request, res: Response): Promise<void> => {
    try {
        const { boardId, columnId } = req.params;
        const userId = (req.user as IUser).id;

        await deleteColumnService(boardId, columnId, userId);

        // Note: For simplicity, we will refetch on the client-side.
        // A socket event could be added here for optimization.

        res.status(200).json({ message: 'Column deleted successfully' });
    } catch (error) {
        const err = error as Error;
        if(err.message === 'Unauthorized') {
            res.status(403).json({ message: 'Forbidden' });
        } else {
            res.status(500).json({ message: 'Server Error', error: err.message });
        }
    }
};

