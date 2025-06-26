import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } 
    catch (error) {
      console.log("Error in getUserProfile controller", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id.toString()  ) {
            return res.status(404).json({ error: "you cannot follow/unfollow yourself" });
        }
        if (!userToModify || !currentUser   ) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user is already following the target user
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, {
                $pull: { followers: req.user._id }
            });
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { following: id }
            });
            //TODO return the id of the user who unfollowed
            return res.status(200).json({ message: "Unfollowed user successfully", user: currentUser });
        } 
         else{
            await User.findByIdAndUpdate(id, {
                $push: { followers: req.user._id }
            });
            await User.findByIdAndUpdate(req.user._id, {
                $push: { following: id }
            });
            return res.status(200).json({ message: "Followed user successfully", user: currentUser });
            //send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id,
            })
            await newNotification.save();
            // Optionally, you can also send the notification to the user
            res.status(200).json({ message: "Followed user successfully", user: currentUser, notification: newNotification              
        } );
        }

    } catch (error) {
        console.log("Error in followUnfollowUser controller", error.message);  
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id).select("-password");
        if (!currentUser) {
            return res.status(404).json({ error: "Current user not found" });
        }
        const usersFollowedByMe = await User.findById(req.user._id)
            .select("following");
        
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: req.user._id, $nin: currentUser.following }
                }
            },
            {
                $sample: { size: 10 } // Randomly select 10 users
            },
           
        ]);

       const filteredUsers = users.filter(user => {
            return !currentUser.following.includes(user._id.toString());
        });
        const suggestedUsers = filteredUsers.slice(0,4);

        suggestedUsers.forEach(user => {user.password = null})
        

        res.status(200).json(suggestedUsers );
    } catch (error) {
        console.log("Error in getSuggestedUsers controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const updateProfile = async (req, res) => {
    const { fullName,username, email, currentPassword, newPassword, bio,link } = req.body;

    let { profileImg, coverImg } = req.body;

    const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}

}