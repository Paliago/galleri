import { Button } from "@/components/ui/button";
import { useAlbums } from "@/hooks/use-albums";
import { ImagePlus, PlusCircle } from "lucide-react";
import { Link } from "react-router";

export default function AlbumsManagementPage() {
  const { data: albums = [] } = useAlbums();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Albums</h2>
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
        {albums.map((album) => (
          <Link to={`/gallerist/albums/${album.id}`} key={album.id}>
            <div className="relative border-none rounded-lg overflow-hidden group">
              <div className="relative aspect-square">
                {album.albumCover ? (
                  <img
                    src={`${import.meta.env.VITE_CDN_URL}${album.albumCover}`}
                    alt={album.name}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  />
                ) : (
                  <div className="bg-muted/50 flex items-center justify-center text-muted-foreground h-full">
                    <ImagePlus className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="p-2 bg-secondary">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    <p>{album.name}</p>
                    <p>{album.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
