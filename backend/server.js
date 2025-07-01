import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';
import connectDB from './db/connect.js';
import cookieParser from 'cookie-parser';
const app = express();
dotenv.config();

const __dirname = path.resolve();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, '/frontend/dist')));

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'frontend','dist','index.html'));
	})                         
}
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB()
});