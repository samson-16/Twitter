import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


const useFollow = () => {
    const queryClinet = useQueryClient();

    const {mutate:follow, isPending}=useMutation({
        mutationFn: async (userId) => {
            try {
                const response = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error("Failed to follow user");
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error following user:", error);
                throw error;
            }
        },
        onSuccess: (data) => {
            Promise.all([
                queryClinet.invalidateQueries({ queryKey: ["authUser"] }),
                queryClinet.invalidateQueries({ queryKey: ["suggestedUsers"] }),
            ]).then(() => {
                console.log("Followed user successfully:", data);
            }).catch((error) => {
                console.error("Error invalidating queries after follow:", error);
            });

        },
        onError: (error) => {
            console.error("Error following user:", error);
            toast.error("Failed to follow user");
        }
     
    })

    return {
        follow,
        isPending,
    }; 
}
export default useFollow;