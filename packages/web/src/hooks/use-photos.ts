import { useQuery } from "@tanstack/react-query";
import { Photo } from "@galleri/core/photo";

export function usePhotos() {
  return useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}photo`);

      if (!res.ok) {
        throw new Error(`Failed to fetch photos: ${res.statusText}`);
      }

      return (await res.json()) as Photo.PhotoData[];
    },
  });
}
