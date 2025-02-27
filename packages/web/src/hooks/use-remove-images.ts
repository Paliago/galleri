import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRemoveImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageIds: string[]) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}image/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageIds),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};
