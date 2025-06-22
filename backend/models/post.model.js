import { text } from "express";
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
     user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
     },
     text :{
        type: String,
        
     },
     img:{
        type: String,
        default: ""
     },
     likes :[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
     ],
     comments:[
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
     ]
},
{
    timestamps: true
});

const Post = mongoose.model("Post", postSchema);
export default Post;