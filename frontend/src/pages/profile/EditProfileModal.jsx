import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EditProfileModal = ({authUser}) => {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const {mutate: updateProfile, isPending, isError, error} = useMutation({
		mutationFn: async () => {
			try {
				const response = await fetch("/api/users/update", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				});
				const date = await response.json();
				if (!response.ok) {
					throw new Error(date.error || "Failed to update profile");
				}
				return date;
			} catch (error) {
				throw new Error(error.message || "An error occurred while updating profile");
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully!");
			setFormData({
				fullName: "",
				username: "",
				email: "",
				bio: "",
				link: "",
				newPassword: "",
				currentPassword: "",
			});
			Promise.all([
					queryClient.invalidateQueries({ queryKey: ["authUser"] }),
					queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			])

			document.getElementById("edit_profile_modal").close();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
		}
	});
	useEffect(()=>{
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "",
				username: authUser.username || "",
				email: authUser.email || "",
				bio: authUser.bio || "",
				link: authUser.link || "",
				newPassword: "",
				currentPassword: "",
			});
		}
	},[authUser]);
	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
						className='flex flex-col gap-4'
						onSubmit={(e) => {
							e.preventDefault();
							updateProfile();
						}}
					>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Full Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.fullName}
								name='fullName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='Username'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.username}
								name='username'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='email'
								placeholder='Email'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.email}
								name='email'
								onChange={handleInputChange}
							/>
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/>
						<button className='btn btn-primary rounded-full btn-sm text-white'>
							{isPending ? "Updating..." : "Update Profile"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;