import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import { commentOnPost, createPost, deletePost, getFollowingPosts, getLikedPosts, getPosts,  getUserPosts,  likeUnlikePost } from '../controllers/post.controller.js';

const router = express.Router();


// Define the routes
router.post('/create', protectedRoute, createPost);
router.get('/all', protectedRoute, getPosts);
router.get('/following', protectedRoute, getFollowingPosts);
 

router.post('/like/:id', protectedRoute, likeUnlikePost);
router.get('/user/:username', protectedRoute, getUserPosts);
router.get('/likes/:id', protectedRoute, getLikedPosts);
router.post('/comment/:id', protectedRoute, commentOnPost);
router.delete('/:id', protectedRoute, deletePost);

export default router;