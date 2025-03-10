import { useQuery } from "@tanstack/react-query";
import { Album } from "@galleri/core/album";

export function useAlbumPhotos(albumId: string) {
  return useQuery({
    queryKey: ["photos", albumId],
    queryFn: async (albumId) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}album/${albumId}/photos`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch album photos: ${res.statusText}`);
      }

      return (await res.json()) as Album.AlbumPhoto[];
    },
  });
}
