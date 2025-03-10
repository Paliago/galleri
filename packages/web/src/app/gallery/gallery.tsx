import { usePhotos } from "@/hooks/use-photos";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function Gallery() {
  const title = "gallery";
  const description = "a gallery of photos";
  const darkMode = true;
  const borderRadius: string = "md"; // options: "none", "sm", "md", "lg", "xl", "full"

  const { data: photos, isLoading } = usePhotos();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case "none":
        return "";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "xl":
        return "rounded-xl";
      case "full":
        return "rounded-full";
      default:
        return "rounded";
    }
  };

  const openLightbox = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const navigateToNext = () => {
    if (!photos?.length) return;
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const navigateToPrev = () => {
    if (!photos?.length) return;
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case "ArrowRight":
          navigateToNext();
          break;
        case "ArrowLeft":
          navigateToPrev();
          break;
        case "Escape":
          closeLightbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  if (isLoading) {
    return (
      <div className={cn(darkMode ? "bg-gray-900" : "bg-amber-50")}>
        <div className="mb-10 animate-pulse flex flex-col items-center">
          <div
            className={cn(
              "h-10 w-48 mb-3",
              darkMode ? "bg-black/20" : "bg-amber-50",
              getBorderRadiusClass(),
            )}
          />
          <div
            className={cn(
              "h-8 w-64",
              darkMode ? "bg-black/20" : "bg-amber-100/80",
              getBorderRadiusClass(),
            )}
          />
        </div>
        <div className="columns-1 lg:columns-2 2xl:columns-3 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "animate-pulse mb-4 overflow-hidden h-[330px] w-auto",
                darkMode ? "bg-black/20" : "bg-amber-100",
                getBorderRadiusClass(),
              )}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className={cn(darkMode ? "bg-gray-900" : "bg-amber-50")}>
        <h1 className="text-4xl mb-2 font-light tracking-tight">{title}</h1>
        <p
          className={cn(
            "text-xl max-w-2xl mx-auto leading-relaxed",
            darkMode ? "text-gray-300/80" : "text-amber-800/80",
          )}
        >
          {description}
        </p>
        <p
          className={cn(
            "mt-8",
            darkMode ? "text-gray-300/80" : "text-amber-700/70",
          )}
        >
          no photos available to display
        </p>
      </div>
    );
  }

  return (
    <div className={cn(darkMode ? "bg-gray-900" : "bg-amber-50")}>
      <header className="mb-10 text-center">
        <h1
          className={cn(
            "text-4xl mb-3 font-light tracking-tigh ",
            darkMode ? "text-white" : "text-amber-900",
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            "text-xl max-w-2xl mx-auto leading-relaxed",
            darkMode ? "text-gray-300/80" : "text-amber-800/80",
          )}
        >
          {description}
        </p>
      </header>

      <div className="columns-1 lg:columns-2 2xl:columns-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.photoId}
            className={cn(
              "relative mb-4 break-inside-avoid overflow-hidden cursor-pointer group",
              getBorderRadiusClass(),
            )}
            onClick={() => openLightbox(index)}
          >
            <img
              src={import.meta.env.VITE_CDN_URL + photo.urls?.lg}
              alt={photo.originalFilename || "photo"}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
            {/* {photo.caption && ( */}
            {/**/}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 backdrop-blur-md p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                darkMode ? "bg-black/40 text-white" : "bg-white/30 text-black",
              )}
            >
              <p className="italic text-center text-sm">photo caption</p>
            </div>
            {/* )} */}
          </div>
        ))}
      </div>

      {lightboxOpen && photos && photos.length > 0 && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <button
            className="absolute top-5 right-8 text-white text-4xl bg-transparent border-none cursor-pointer z-[60] hover:text-amber-300 transition-colors duration-300"
            onClick={closeLightbox}
            aria-label="close lightbox"
          >
            ×
          </button>
          <button
            className="absolute top-1/2 left-5 -translate-y-1/2 bg-black/40 text-white border-none w-12 h-12 rounded-full text-3xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-amber-600/50 z-[60]"
            onClick={navigateToPrev}
            aria-label="previous photo"
          >
            ‹
          </button>
          <div className="relative max-w-[90%] max-h-[90vh]">
            <img
              src={
                import.meta.env.VITE_CDN_URL +
                photos[currentPhotoIndex].urls?.display
              }
              alt={photos[currentPhotoIndex].originalFilename || "photo"}
              className="max-w-full max-h-[85vh] object-contain rounded shadow-xl"
            />
            <div className="absolute -bottom-10 left-0 right-0 text-center text-white/90 p-2.5 text-base">
              <p className="italic">photo caption</p>
            </div>
          </div>
          <button
            className="absolute top-1/2 right-5 -translate-y-1/2 bg-black/40 text-white border-none w-12 h-12 rounded-full text-3xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-amber-600/50 z-[60]"
            onClick={navigateToNext}
            aria-label="next photo"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
