import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';

// Import all controller functions
import {
    getBoards,
    createBoard,
    getBoardById,
    updateBoard,
    shareBoard,
    getPublicBoard,
    clearColumn,
    addColumn,
    deleteColumn
} from '../controllers/boardController';

const router = Router();

// This new route is for accessing public boards.
// Note that it is outside the main block and has a different path.
// It is protected by requireAuth to ensure only logged-in users can view public boards.
router.get('/public/:publicId', requireAuth, getPublicBoard);


// All routes below are for a user's own boards and are protected.
router.route('/')
    .get(requireAuth, getBoards)
    .post(requireAuth, createBoard);

// Route for a user to share their own board
router.route('/:boardId/share')
    .post(requireAuth, shareBoard);

router.route('/:boardId')
    .get(requireAuth, getBoardById)
    .put(requireAuth, updateBoard);

router.route('/:boardId/columns/:columnId/tasks')
    .delete(requireAuth, clearColumn);

router.route('/:boardId/columns')
    .post(requireAuth, addColumn);

router.route('/:boardId/columns/:columnId')
    .delete(requireAuth, deleteColumn);

export default router;