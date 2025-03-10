import { FileItem } from "@/app/gallerist/pictures/upload";
import { useState, useEffect } from "react";

export function useObjectUrl(file: FileItem["file"]) {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}
