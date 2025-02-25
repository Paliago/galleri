import { useImages } from "@/hooks/use-images";

export default function Home() {
  const { data: images } = useImages();

  return (
    <>
      {images
        ? images.map((img) => (
            <img
              src={`${import.meta.env.VITE_CDN_URL}lg/${img.originalFilename}`}
              className="rounded-xl"
            />
          ))
        : undefined}
    </>
  );
}
