import { useQuery } from "@tanstack/react-query";
import { Image } from "@galleri/core/image";

export function useImage(id: string) {
  return useQuery({
    queryKey: ["image", id],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}image/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Image not found: ${id}`);
        }
        throw new Error(`Failed to fetch image: ${res.statusText}`);
      }

      return (await res.json()) as Image.ImageData;
    },
    enabled: !!id,
  });
}
