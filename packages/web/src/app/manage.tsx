import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useImages } from "@/hooks/use-images";
import { Link } from "react-router";
import { Image } from "@galleri/core/image";
import { ManageImageCard } from "@/components/manage-image-card";
import { ManageLightbox } from "@/components/manage-lightbox";
import { useRemoveImages } from "@/hooks/use-remove-images";

export default function ManagementPage() {
  const { data: images = [] } = useImages();
  const { mutateAsync: removeImages } = useRemoveImages();
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Calculate the selected image based on the index
  const selectedImage =
    selectedImageIndex >= 0 && selectedImageIndex < images.length
      ? images[selectedImageIndex]
      : null;

  const handleDelete = (photoIds: string[]) => {
    setSelected(selected.filter((img) => !photoIds.includes(img)));
    setSelectedImages((prev) => {
      const newSelection = new Set(prev);
      photoIds.forEach((id) => newSelection.delete(id));
      return newSelection;
    });

    // Close lightbox if current image is deleted
    if (selectedImage && photoIds.includes(selectedImage.photoId)) {
      setLightboxOpen(false);
    }

    removeImages(photoIds);
  };

  const handleAddToAlbum = (photoIds: string[], albumId: string) => {
    // Implement add to album functionality
    console.log(`Adding photos ${photoIds.join(", ")} to album ${albumId}`);
  };

  const openLightbox = (image: Image.ImageData) => {
    // Find the index of the image in the array
    const index = images.findIndex((img) => img.photoId === image.photoId);
    if (index !== -1) {
      setSelectedImageIndex(index);
      setLightboxOpen(true);
    }
  };

  const navigateToPrevious = useCallback(() => {
    if (images.length <= 1) return;

    setSelectedImageIndex((prevIndex) => {
      if (prevIndex <= 0) {
        // Wrap around to the last image
        return images.length - 1;
      }
      return prevIndex - 1;
    });
  }, [images.length]);

  const navigateToNext = useCallback(() => {
    if (images.length <= 1) return;

    setSelectedImageIndex((prevIndex) => {
      if (prevIndex >= images.length - 1) {
        // Wrap around to the first image
        return 0;
      }
      return prevIndex + 1;
    });
  }, [images.length]);

  const toggleImageSelection = (photoId: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedImages(newSelection);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Photos</h2>
        <div className="flex gap-4">
          <div className="transition-all duration-300 ease-in-out">
            {selectedImages.size > 0 && (
              <>
                <Button
                  onClick={() => handleDelete(Array.from(selectedImages))}
                  variant="destructive"
                  className="mr-2 transition-all duration-300 ease-in-out"
                >
                  Delete Selected ({selectedImages.size})
                </Button>
                <Button
                  onClick={() =>
                    handleAddToAlbum(Array.from(selectedImages), "newAlbum")
                  }
                  className="transition-all duration-300 ease-in-out"
                >
                  Add Selected to Album ({selectedImages.size})
                </Button>
              </>
            )}
          </div>
          <Link to="/gallerist/pictures/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image) => (
          <ManageImageCard
            key={image.photoId}
            image={image}
            isSelected={selectedImages.has(image.photoId)}
            onToggleSelection={toggleImageSelection}
            onDelete={handleDelete}
            onAddToAlbum={handleAddToAlbum}
            onOpenLightbox={openLightbox}
          />
        ))}
      </div>

      {selectedImage && (
        <ManageLightbox
          image={selectedImage}
          isOpen={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onDelete={handleDelete}
          onAddToAlbum={handleAddToAlbum}
          onNavigatePrevious={navigateToPrevious}
          onNavigateNext={navigateToNext}
          totalImages={images.length}
          currentIndex={selectedImageIndex}
        />
      )}
    </div>
  );
}
