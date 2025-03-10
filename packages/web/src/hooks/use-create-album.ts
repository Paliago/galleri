import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Album } from "@galleri/core/album";

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (album: Album.CreateAlbum) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}album`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(album),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return res.json() as unknown as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["albums"] });
    },
  });
};
