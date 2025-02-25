import { useMutation } from "@tanstack/react-query";
import { Upload } from "@galleri/core/upload";

type GetPresignedUrlResponse = {
  uploadUrl: string;
  photoId: string;
};

export const useGetPresignedUrl = () => {
  return useMutation({
    mutationFn: async (data: Upload.UploadRequirements) => {
      const response = await fetch(import.meta.env.VITE_API_URL + "upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.status}`);
      }

      return (await response.json()) as GetPresignedUrlResponse;
    },
  });
};
