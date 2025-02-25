import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UploadedImageCard } from "@/components/uploaded-image-card";
import { useGetPresignedUrl } from "@/hooks/use-get-presigned-url";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UploadCloud,
  File,
  Cloud,
  ImageIcon,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";

type FileStatus = "queued" | "preparing" | "uploading" | "complete" | "error";

interface FileItem {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

// TODO: handle duplicates
// TODO: have a preview when added to the queue but not yet started the upload
// TODO: make the preview images in the queue not reload every time a state updated
export default function UploadPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const presignedUrlMutation = useGetPresignedUrl();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: "queued" as FileStatus,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Handle rejected files
      if (fileRejections.length > 0) {
        toast.error("Some files were rejected", {
          description: "Only image files are accepted",
        });
      }
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const uploadAllFiles = async () => {
    const queuedFiles = files.filter((f) => f.status === "queued");

    if (queuedFiles.length === 0) return;

    toast("Upload started", {
      description: `Uploading ${queuedFiles.length} files`,
    });

    const batchSize = 4;
    for (let i = 0; i < queuedFiles.length; i += batchSize) {
      const batch = queuedFiles.slice(i, i + batchSize);
      await Promise.all(batch.map((fileItem) => uploadSingleFile(fileItem)));
    }
  };

  const uploadSingleFile = async (fileItem: FileItem) => {
    try {
      updateFileStatus(fileItem.id, "preparing");

      const { uploadUrl, photoId } = await presignedUrlMutation.mutateAsync({
        contentType: fileItem.type,
        size: fileItem.size,
      });

      updateFileStatus(fileItem.id, "uploading");

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", fileItem.type);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          updateFileProgress(fileItem.id, progress);
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(fileItem.file);
      });

      updateFileStatus(fileItem.id, "complete");
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: photoId,
          name: fileItem.name,
          size: fileItem.size,
          type: fileItem.type,
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      updateFileStatus(fileItem.id, "error");
      toast.error("Upload Failed", {
        description: `Failed to upload ${fileItem.name}`,
      });
    }
  };

  const updateFileStatus = (id: string, status: FileStatus) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  const updateFileProgress = (id: string, progress: number) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress } : f)));
    setUploadProgress((prev) => ({ ...prev, [id]: progress }));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case "preparing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "uploading":
        return <UploadCloud className="h-4 w-4" />;
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const uploadingCount = files.filter(
    (f) => f.status === "uploading" || f.status === "preparing",
  ).length;
  const completedCount = files.filter((f) => f.status === "complete").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Photos</h1>
        {files.length > 0 && (
          <div className="flex space-x-2">
            <Badge variant="outline">{files.length} Files</Badge>
            {queuedCount > 0 && (
              <Badge variant="outline" className="bg-blue-50">
                {queuedCount} Queued
              </Badge>
            )}
            {uploadingCount > 0 && (
              <Badge variant="outline" className="bg-yellow-50">
                {uploadingCount} Uploading
              </Badge>
            )}
            {completedCount > 0 && (
              <Badge variant="outline" className="bg-green-50">
                {completedCount} Completed
              </Badge>
            )}
            {errorCount > 0 && (
              <Badge variant="destructive">{errorCount} Failed</Badge>
            )}
          </div>
        )}
      </div>

      {/* Dropzone */}
      <Card>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
            transition-colors hover:bg-muted/50
            ${isDragActive ? "border-primary bg-muted/50" : "border-muted-foreground/25"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Cloud className="h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">
              {isDragActive ? "Drop images here" : "Drag & drop images here"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Or click to browse files
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      {queuedCount > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={uploadAllFiles}
            disabled={presignedUrlMutation.isLoading || queuedCount === 0}
            className="gap-2"
          >
            {presignedUrlMutation.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Upload {queuedCount} {queuedCount === 1 ? "File" : "Files"}
          </Button>
        </div>
      )}

      {/* File Queue */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>File Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-3 border rounded-md"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-10 w-10 rounded-md">
                            {file.type.startsWith("image/") &&
                            file.status !== "queued" ? (
                              <AvatarImage
                                src={getFilePreview(file.file) || undefined}
                                alt={file.name}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="rounded-md bg-muted">
                                <ImageIcon className="h-5 w-5" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>Preview</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              file.status === "complete"
                                ? "secondary"
                                : file.status === "error"
                                  ? "destructive"
                                  : file.status === "uploading"
                                    ? "default"
                                    : "outline"
                            }
                          >
                            {getStatusIcon(file.status)}
                            <span className="ml-1">{file.status}</span>
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>

                          {file.status === "queued" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {file.status === "uploading" && (
                        <div className="mt-2">
                          <Progress value={file.progress} className="h-2" />
                          <p className="text-xs text-right mt-1 text-muted-foreground">
                            {file.progress}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files Gallery */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedFiles.map((file) => (
                <UploadedImageCard key={file.id} file={file} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
