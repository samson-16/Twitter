import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";


// createPost function to handle post creation
export const createPost = async(req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString() ;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!text && !img) {
            return res.status(400).json({ error: "Post must have either text or image" });
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const post = new Post({
            text,
            img,
            user: userId
        });
        await post.save();
        res.status(201).json({ message: "Post created successfully", post });

        
    } catch (error) {
        
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }

}


// deletePost function to handle post deletion
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id.toString();

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }

        // If the post has an image, delete it from Cloudinary
        if (post.img) {
            const publicId = post.img.split('/').pop().split('.')[0]; // Extract public ID from the URL
            await cloudinary.uploader.destroy(publicId);
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
// commentOnPost function to handle commenting on a post
export const commentOnPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (!text) {
            return res.status(400).json({ error: "Comment text is required" });
        }

        const comment = {
            user: userId,
            text,
            createdAt: new Date()
        };

        post.comments.push(comment);
        await post.save();

        res.status(201).json({ message: "Comment added successfully", comment });

    } catch (error) {
        console.error("Error commenting on post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// likeUnliePost function to handle liking or unliking a post
export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

       const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}

    } catch (error) {
        console.error("Error liking/unliking post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// getPosts function to retrieve all posts
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate(
           { path: 'user',
            select: '-password'}
        ).populate({
            path: 'comments.user',
            select: '-password'
        })
        if (posts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

// getLikedPosts function to retrieve posts liked by the user
export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: '-password' })
            .populate({path: 'comments.user', select: '-password'});
        if (likedPosts.length === 0) {
            return res.status(200).json([]);
        }
        res.status(200).json(likedPosts);

    } catch (error) {
        console.error("Error fetching liked posts:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

}


export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;
        if (following.length === 0) {
            return res.status(200).json([]); // No following users, return empty array
        }
        const feedPosts = await Post.find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: '-password' })
            .populate({ path: 'comments.user', select: '-password' });

        res.status(200).json(feedPosts);

    } catch (error) {
        console.error("Error fetching following posts:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        
console.log("Fetching posts for:", username);

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({ path: 'user', select: '-password' })
            .populate({ path: 'comments.user', select: '-password' });
        if (posts.length === 0) {
            return res.status(200).json([]);
        }   
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching user posts:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}