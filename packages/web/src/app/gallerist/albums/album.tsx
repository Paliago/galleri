import { Button } from "@/components/ui/button";
import { useAlbum } from "@/hooks/use-album";
import { useAlbumPhotos } from "@/hooks/use-album-photos";
import { usePhotos } from "@/hooks/use-photos";
import { cn, formatDate, formatFileSize } from "@/lib/utils";
import { Photo } from "@galleri/core/photo";
import { PlusCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, Navigate, useParams } from "react-router";

export default function AlbumManagementPage() {
  const { id } = useParams();
  if (!id) {
    return <Navigate to="/gallerist/albums" />;
  }
  const { data: album, isLoading } = useAlbum(id);
  // TODO: should remove the albumPhotos from photos so you can't add a photo that's already in the album
  const { data: photos = [] } = usePhotos();
  const { data: albumPhotos = [] } = useAlbumPhotos(id);

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

    // removePhotos(photoIds);
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
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{album?.name}</h2>
        <div className="flex gap-4">
          <Link to="/gallerist/albums/create">
            <Button>
              <PlusCircle className="h-4 w-4" />
              Create Album
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="relative border-none rounded-lg overflow-hidden group">
          {photos.map((photo) => (
            <>
              {/* <div
        className={cn(
          "absolute top-2 left-2 z-10 transition-opacity duration-300 ease-in-out",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        <div className="w-5 h-5 flex items-center justify-center rounded">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(photo.photoId)}
            className="bg-primary"
          />
        </div>
      </div>
      <div
        className={cn(
          `absolute inset-0 transition-colors duration-300 ease-in-out`,
          isSelected ? "bg-blue-500/20" : "group-hover:bg-black/10",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onToggleSelection(photo.photoId);
          }
        }}
      /> */}
              <div className="relative aspect-square">
                <img
                  src={`${import.meta.env.VITE_CDN_URL}${photo.urls?.display}`}
                  alt={photo.originalFilename}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  // onClick={(e) => {
                  //   e.stopPropagation();
                  //   onOpenLightbox(photo);
                  // }}
                />
              </div>
              <div className="p-2 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <p>{formatFileSize(photo.size)}</p>
                    <p>{formatDate(photo.createdAt)}</p>
                  </div>
                </div>
              </div>
              {/* {!isSelected && (
        <div className="absolute bottom-2 right-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 relative z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-30">
              <DropdownMenuItem
                onSelect={() => onAddToAlbum([photo.photoId], "newAlbum")}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add to Album
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onDelete([photo.photoId])}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )} */}
            </>
          ))}
        </div>
      </div>
    </>
  );
}
