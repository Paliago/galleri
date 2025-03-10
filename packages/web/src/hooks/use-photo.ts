import { useQuery } from "@tanstack/react-query";
import { Photo } from "@galleri/core/photo";

export function usePhoto(id: string) {
  return useQuery({
    queryKey: ["photo", id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}photo/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Photo not found: ${id}`);
        }
        throw new Error(`Failed to fetch photo: ${res.statusText}`);
      }

      return (await res.json()) as Photo.PhotoData;
    },
    enabled: !!id,
  });
}
