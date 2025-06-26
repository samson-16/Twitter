import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
// import { POSTS } from "../../utils/db/dummy";
import {  useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({feedType, username , userId}) => {
	// const isLoading = false;
	const getPostEndPoint = ()=>{
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "/api/posts/all";
		
	}
} 


 const POST_ENDPOINT = getPostEndPoint();
	
	const {data: POSTS, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			  try {
				 const response = await fetch(POST_ENDPOINT, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});
				if (!response.ok) {
					throw new Error( "Failed to fetch posts");
				}
				const data = await response.json();
				return data

			  } catch (error) {
				throw new Error("Failed to fetch posts");
			  }
	
			}
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username, userId]);
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && POSTS?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && POSTS && (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
}
export default Posts;