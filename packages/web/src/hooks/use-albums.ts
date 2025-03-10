import { useQuery } from "@tanstack/react-query";
import { Album } from "@galleri/core/album";

export function useAlbums() {
  return useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}album`);

      if (!res.ok) {
        throw new Error(`Failed to fetch albums: ${res.statusText}`);
      }

      return (await res.json()) as Album.Album[];
    },
  });
}
