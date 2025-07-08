import { Router } from 'express';
import { createTask, deleteTask, updateTask, moveTask } from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Protect all task routes
router.use(requireAuth);

router.route('/')
    .post(createTask);

router.route('/:taskId')
    .put(updateTask)
    .delete(deleteTask);

router.route('/:taskId/move')
    .put(moveTask);

export default router;