import { UploadedFile } from "@/app/upload";
import { useImage } from "@/hooks/use-image";
import { Card, CardFooter } from "./ui/card";
import { AlertCircle, ImageIcon, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function UploadedImageCard({ file }: { file: UploadedFile }) {
  const { data: image, isLoading, isError, refetch } = useImage(file.id);

  const [processingRetries, setProcessingRetries] = useState(0);

  // Automatically retry fetching the image data if URLs are not yet available
  useEffect(() => {
    if (image && !image.urls && processingRetries < 5) {
      const timer = setTimeout(() => {
        refetch();
        setProcessingRetries((prev) => prev + 1);
      }, 2000); // Retry every 2 seconds

      return () => clearTimeout(timer);
    }
  }, [image, refetch, processingRetries]);

  // Determine if the image is in processing state (uploaded but no URLs yet)
  const isProcessing = image && !image.urls;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500/50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : isProcessing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 text-amber-500/50 animate-spin" />
            <p className="text-xs text-muted-foreground">Processing image...</p>
          </div>
        ) : image?.urls ? (
          <img
            src={import.meta.env.VITE_CDN_URL + image.urls.md}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardFooter className="p-2">
        <div className="w-full">
          <p className="text-xs font-medium truncate">{file.name}</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
            {image?.metadata && (
              <p className="text-xs text-muted-foreground">
                {image.metadata.width} × {image.metadata.height}
              </p>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
}
