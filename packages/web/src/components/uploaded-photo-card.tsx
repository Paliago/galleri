import { UploadedFile } from "@/app/gallerist/pictures/upload";
import { Card, CardFooter } from "./ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatFileSize } from "@/lib/utils";

export function UploadedPhotoCard({ file }: { file: UploadedFile }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const photoUrl =
    import.meta.env.VITE_CDN_URL + "sm/" + file.id + "." + file.extension;

  // Initial delay before first attempt
  useEffect(() => {
    if (loadAttempt === 0) {
      const initialTimer = setTimeout(() => {
        setLoadAttempt(1);
      }, 2000); // Wait 2 seconds before first attempt

      return () => clearTimeout(initialTimer);
    }
  }, [loadAttempt]);

  // Retry logic with longer delay
  useEffect(() => {
    // Only set up a timer if we're loading and haven't exceeded max attempts
    if (isLoading && loadAttempt > 0 && loadAttempt < 5) {
      const timer = setTimeout(() => {
        setLoadAttempt((prev) => prev + 1);
      }, 2500); // 2.5 seconds between retries

      return () => clearTimeout(timer);
    }
  }, [isLoading, loadAttempt]);

  const handlePhotoError = () => {
    setIsLoading(true);
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-muted-foreground/50 animate-spin" />
          </div>
        )}
        {loadAttempt > 0 && (
          <img
            key={loadAttempt}
            src={`${photoUrl}?attempt=${loadAttempt}`}
            alt={file.name}
            className="w-full h-full object-cover"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoad={() => setIsLoading(false)}
            onError={handlePhotoError}
          />
        )}
      </div>
      <CardFooter className="p-2">
        <div className="w-full">
          <p className="text-xs font-medium truncate">{file.name}</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
            <p className="text-xs text-muted-foreground">
              {file.width} × {file.height}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
