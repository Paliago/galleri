import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Link } from "react-router";

export default function AlbumManagementPage() {
  // const { data: albums = [] } = useAlbums();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Your Albums</h2>
        <div className="flex gap-4">
          <div className="transition-all duration-300 ease-in-out">
            {/* {selectedImages.size > 0 && ( */}
            {/*   <> */}
            {/*     <Button */}
            {/*       onClick={() => handleDelete(Array.from(selectedImages))} */}
            {/*       variant="destructive" */}
            {/*       className="mr-2 transition-all duration-300 ease-in-out" */}
            {/*     > */}
            {/*       Delete Selected ({selectedImages.size}) */}
            {/*     </Button> */}
            {/*     <Button */}
            {/*       onClick={() => */}
            {/*         handleAddToAlbum(Array.from(selectedImages), "newAlbum") */}
            {/*       } */}
            {/*       className="transition-all duration-300 ease-in-out" */}
            {/*     > */}
            {/*       Add Selected to Album ({selectedImages.size}) */}
            {/*     </Button> */}
            {/*   </> */}
            {/* )} */}
          </div>
          <Link to="/gallerist/pictures/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* {images.map((image) => ( */}
        {/*   <ManageImageCard */}
        {/*     key={image.photoId} */}
        {/*     image={image} */}
        {/*     isSelected={selectedImages.has(image.photoId)} */}
        {/*     onToggleSelection={toggleImageSelection} */}
        {/*     onDelete={handleDelete} */}
        {/*     onAddToAlbum={handleAddToAlbum} */}
        {/*     onOpenLightbox={openLightbox} */}
        {/*   /> */}
        {/* ))} */}
      </div>
    </div>
  );
}
