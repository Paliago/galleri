import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRemovePhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoIds: string[]) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}photo/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(photoIds),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
};
