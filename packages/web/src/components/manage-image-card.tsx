import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFileSize } from "@/lib/utils";
import { Image } from "@galleri/core/image";
import {
  Download,
  Edit,
  FolderPlus,
  MoreVertical,
  Share2,
  Trash2,
} from "lucide-react";

interface ManageImageCardProps {
  image: Image.ImageData;
  isSelected: boolean;
  onToggleSelection: (photoId: string) => void;
  onDelete: (photoIds: string[]) => void;
  onAddToAlbum: (photoIds: string[], albumId: string) => void;
  onOpenLightbox: (image: Image.ImageData) => void;
}

export function ManageImageCard({
  image,
  isSelected,
  onToggleSelection,
  onDelete,
  onAddToAlbum,
  onOpenLightbox,
}: ManageImageCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative border rounded-lg overflow-hidden group">
      <div className="absolute top-2 left-2 z-10 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100">
        <div
          className={`w-5 h-5 flex items-center justify-center bg-white rounded ${
            isSelected ? "opacity-100" : ""
          }`}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(image.photoId)}
          />
        </div>
      </div>
      <div
        className={`absolute inset-0 transition-colors duration-300 ease-in-out ${
          isSelected ? "bg-blue-500/20" : "hover:bg-black/10"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onToggleSelection(image.photoId);
          }
        }}
      />
      <div className="relative aspect-square">
        <img
          src={`${import.meta.env.VITE_CDN_URL}${image.urls?.display}`}
          alt={image.originalFilename}
          className="absolute inset-0 w-full h-full object-cover cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(image);
          }}
        />
      </div>
      <div className="p-2 bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            <p>{formatFileSize(image.size)}</p>
            <p>{formatDate(image.createdAt)}</p>
          </div>
        </div>
      </div>
      {!isSelected && (
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
                onSelect={() => onAddToAlbum([image.photoId], "newAlbum")}
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
                onSelect={() => onDelete([image.photoId])}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
