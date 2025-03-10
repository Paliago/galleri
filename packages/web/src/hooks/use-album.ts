import { useQuery } from "@tanstack/react-query";
import { Album } from "@galleri/core/album";

export function useAlbum(id: string) {
  return useQuery({
    queryKey: ["album", id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}album/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Album not found: ${id}`);
        }
        throw new Error(`Failed to fetch album: ${res.statusText}`);
      }

      return (await res.json()) as Album.Album;
    },
    enabled: !!id,
  });
}
