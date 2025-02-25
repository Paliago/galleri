import { useImages } from "@/hooks/use-images";

export default function Home() {
  const { data: images } = useImages();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images
        ? images.map((img) => (
            <img
              src={`${import.meta.env.VITE_CDN_URL}lg/${img.originalFilename}`}
              className="rounded-xl"
            />
          ))
        : undefined}
    </div>
  );
}
