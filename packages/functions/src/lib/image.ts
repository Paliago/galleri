import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { GetImgSourceArgs, ImgSource } from "openimg/node";
import { Resource } from "sst/resource";

const s3Client = new S3Client({});

export async function getImgSource({
  params,
}: GetImgSourceArgs): Promise<ImgSource> {
  const src = params.src;

  const headers = new Headers();

  const command = new GetObjectCommand({
    Bucket: Resource.Storage.name,
    Key: src,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 30 });

  return {
    type: "fetch",
    url,
    headers,
  };
}
