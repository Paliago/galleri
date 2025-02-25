import { useQuery } from "@tanstack/react-query";
import { Image } from "@galleri/core/image";

export function useImages() {
  return useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}image`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Images not found`);
        }
        throw new Error(`Failed to fetch images: ${res.statusText}`);
      }

      return (await res.json()) as Image.ImageData[];
    },
  });
}
