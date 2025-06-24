import Notification from "../models/notification.model.js";


export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const notifications = await Notification.find({ to: userId })
           
            .populate({
                path: 'from', 
                select: 'username profileImg]'
            })
        await Notification.updateMany({ read: true }, {to: userId});
        if (!notifications) {
            return res.status(404).json({ error: "No notifications found" });
        }
       

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "All notifications deleted successfully" });
        

    } catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteOneNotification = async (req, res) => {

    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        if (!notificationId) {
            return res.status(400).json({ error: "Notification ID is required" });
        }
     
        if (notificationId.to.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this notification" });
        }
        
        const notification = await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: "Notification deleted successfully" });
    }

    catch (error) {
        console.error("Error deleting notification:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}




// export const markAsRead = async (req, res) => {
//     try {
//         const notificationId = req.params.id;

//         if (!notificationId) {
//             return res.status(400).json({ error: "Notification ID is required" });
//         }

//         const notification = await Notification.findByIdAndUpdate(
//             notificationId,
//             { read: true },
//             { new: true }
//         );

//         if (!notification) {
//             return res.status(404).json({ error: "Notification not found" });
//         }

//         res.status(200).json(notification);
//     } catch (error) {
//         console.error("Error marking notification as read:", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }

