import { cn } from "@/lib/utils";
import { Fit, Img } from "openimg/react";

function calculateNewResolution(
  originalWidth: number,
  originalHeight: number,
  targetSize: number = 500000,
): { width: number; height: number } | null {
  const aspectRatio = originalWidth / originalHeight;

  // Calculate the new width based on the target size and aspect ratio
  let newWidth = Math.sqrt(targetSize * aspectRatio);
  let newHeight = targetSize / newWidth;

  // Round to the nearest integer
  newWidth = Math.round(newWidth);
  newHeight = Math.round(newHeight);

  // Ensure that the new dimensions are smaller than the original
  if (newWidth >= originalWidth || newHeight >= originalHeight) {
    newWidth = originalWidth / 2;
    newHeight = originalHeight / 2;

    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);

    if (newWidth <= 0) {
      newWidth = 1;
    }
    if (newHeight <= 0) {
      newHeight = 1;
    }
  }

  return { width: newWidth, height: newHeight };
}

export default function Thumbnail({
  src,
  originalWidth,
  originalHeight,
  targetSize,
  className,
  isAboveFold,
  fit,
}: {
  src: string;
  originalWidth: number;
  originalHeight: number;
  targetSize?: number;
  className?: string;
  isAboveFold?: boolean;
  fit: Fit;
}) {
  const newResolution = calculateNewResolution(
    originalWidth,
    originalHeight,
    targetSize,
  );

  let width = originalWidth;
  let height = originalHeight;

  if (newResolution) {
    width = newResolution.width;
    height = newResolution.height;
  }

  return (
    <Img
      src={src}
      isAboveFold={isAboveFold}
      width={width}
      height={height}
      fit={fit}
      className={cn("rounded-xl", className)}
    />
  );
}
