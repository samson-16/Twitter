import express from 'express';

import { deleteNotification, deleteOneNotification, getNotifications } from '../controllers/notification.controller.js';
import { protectedRoute } from '../middleware/protectedRoute.js';
const router = express.Router();


router.get('/', protectedRoute, getNotifications);
router.delete('/', protectedRoute,deleteNotification);
router.delete('/:id', protectedRoute,deleteOneNotification);
// router.put('/:id/mark-as-read', markAsRead);


export default router;