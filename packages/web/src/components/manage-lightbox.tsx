import { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Photo } from "@galleri/core/photo";
import {
  Download,
  FolderPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ManageLightboxProps {
  photo: Photo.PhotoData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (photoIds: string[]) => void;
  onAddToAlbum: (photoIds: string[], albumId: string) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  totalPhotos: number;
  currentIndex: number;
}

export function ManageLightbox({
  photo,
  isOpen,
  onOpenChange,
  onDelete,
  onAddToAlbum,
  onNavigatePrevious,
  onNavigateNext,
  totalPhotos,
  currentIndex,
}: ManageLightboxProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "ArrowLeft") {
        onNavigatePrevious();
      } else if (event.key === "ArrowRight") {
        onNavigateNext();
      } else if (event.key === "Escape") {
        onOpenChange(false);
      }
    },
    [isOpen, onNavigatePrevious, onNavigateNext, onOpenChange],
  );

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-4 flex flex-col">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="hidden">Photo Lightbox</DialogTitle>
          <div className="flex items-center gap-2">
            {totalPhotos > 0 && (
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {totalPhotos}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-grow flex flex-col overflow-hidden relative">
          {/* Navigation buttons */}
          {totalPhotos > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 dark:bg-white/30 dark:hover:bg-white/50 rounded-full p-2 text-white dark:text-black transition-all"
                onClick={onNavigatePrevious}
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 dark:bg-white/30 dark:hover:bg-white/50 rounded-full p-2 text-white dark:text-black transition-all"
                onClick={onNavigateNext}
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="relative flex-grow flex items-center justify-center rounded-md overflow-hidden">
            <img
              src={
                photo
                  ? `${import.meta.env.VITE_CDN_URL}${photo.urls?.display}`
                  : undefined
              }
              alt={photo?.originalFilename || ""}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          <div className="mt-4 bg-sidebar dark:bg-gray-900 p-5 rounded-lg shadow-sm border  border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Metadata
                </h4>
                <ul className="space-y-2">
                  <li className="flex">
                    <span className="font-medium w-28">Size:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatFileSize(photo?.size || 0)}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-28">Dimensions:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {photo?.width} × {photo?.height}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-28">Format:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {photo?.metadata?.format}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-28">Color Space:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {photo?.metadata?.space}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Other Information
                </h4>
                <ul className="space-y-2">
                  <li className="flex">
                    <span className="font-medium w-28">Uploaded:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatDate(photo?.createdAt || "")}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-28">Content Type:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {photo?.contentType}
                    </span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-28">Aspect Ratio:</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {photo?.aspectRatio?.toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_CDN_URL}${photo?.urls?.original}`,
                      "_blank",
                    )
                  }
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5"
                  onClick={() => {
                    if (photo) {
                      onAddToAlbum([photo.photoId], "newAlbum");
                    }
                  }}
                >
                  <FolderPlus className="h-4 w-4" />
                  Add to Album
                </Button>
              </div>
              <Button
                variant="destructive"
                className="flex items-center gap-1.5"
                onClick={() => {
                  if (photo) {
                    onDelete([photo.photoId]);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
