import { ManageLightbox } from "@/components/manage-lightbox";
import { ManagePhotoCard } from "@/components/manage-photo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePhotos } from "@/hooks/use-photos";
import { useRemovePhotos } from "@/hooks/use-remove-photos";
import { Photo } from "@galleri/core/photo";
import { FolderPlus, Trash2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";

export default function ManagementPage() {
  const { data: photos = [] } = usePhotos();
  const { mutateAsync: removePhotos } = useRemovePhotos();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Calculate the selected photo based on the index
  const selectedPhoto =
    selectedPhotoIndex >= 0 && selectedPhotoIndex < photos.length
      ? photos[selectedPhotoIndex]
      : null;

  const handleDelete = (photoIds: string[]) => {
    const newSelection = new Set(selectedPhotos);
    photoIds.forEach((id) => newSelection.delete(id));
    setSelectedPhotos(newSelection);

    if (selectedPhoto && photoIds.includes(selectedPhoto.photoId)) {
      setLightboxOpen(false);
    }

    removePhotos(photoIds);
  };

  const handleAddToAlbum = (photoIds: string[], albumId: string) => {
    // Implement add to album functionality
    console.log(`Adding photos ${photoIds.join(", ")} to album ${albumId}`);
  };

  const openLightbox = (photo: Photo.PhotoData) => {
    // Find the index of the photo in the array
    const index = photos.findIndex((img) => img.photoId === photo.photoId);
    if (index !== -1) {
      setSelectedPhotoIndex(index);
      setLightboxOpen(true);
    }
  };

  const navigateToPrevious = useCallback(() => {
    if (photos.length <= 1) return;

    setSelectedPhotoIndex((prevIndex) => {
      if (prevIndex <= 0) {
        // Wrap around to the last photo
        return photos.length - 1;
      }
      return prevIndex - 1;
    });
  }, [photos.length, selectedPhotos]);

  const navigateToNext = useCallback(() => {
    if (photos.length <= 1) return;

    setSelectedPhotoIndex((prevIndex) => {
      if (prevIndex >= photos.length - 1) {
        // Wrap around to the first photo
        return 0;
      }
      return prevIndex + 1;
    });
  }, [photos.length, selectedPhotos]);

  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Photos</h2>

        <div className="flex gap-2">
          {selectedPhotos.size > 0 && (
            <>
              <Badge
                className="cursor-pointer"
                onClick={() => setSelectedPhotos(new Set<string>())}
              >
                Selected: {selectedPhotos.size}
              </Badge>
              <Button
                onClick={() => handleDelete(Array.from(selectedPhotos))}
                variant="destructive"
                className="flex items-center gap-1 px-2 py-1"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden md:inline">Delete</span>
              </Button>
              <Button
                onClick={() =>
                  handleAddToAlbum(Array.from(selectedPhotos), "newAlbum")
                }
                className="flex items-center gap-1 px-2 py-1"
              >
                <FolderPlus className="h-4 w-4" />
                <span className="hidden md:inline">Add to Album</span>
              </Button>
            </>
          )}
          <Link to="/gallerist/pictures/upload">
            <Button>
              <Upload className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Upload</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <ManagePhotoCard
            key={photo.photoId}
            photo={photo}
            isSelected={selectedPhotos.has(photo.photoId)}
            onToggleSelection={togglePhotoSelection}
            onDelete={handleDelete}
            onAddToAlbum={handleAddToAlbum}
            onOpenLightbox={openLightbox}
          />
        ))}
      </div>

      {selectedPhoto && (
        <ManageLightbox
          photo={selectedPhoto}
          isOpen={lightboxOpen}
          onOpenChange={setLightboxOpen}
          onDelete={handleDelete}
          onAddToAlbum={handleAddToAlbum}
          onNavigatePrevious={navigateToPrevious}
          onNavigateNext={navigateToNext}
          totalPhotos={photos.length}
          currentIndex={selectedPhotoIndex}
        />
      )}
    </div>
  );
}
