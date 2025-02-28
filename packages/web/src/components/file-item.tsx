import { FileItem } from "@/app/upload";
import { useObjectUrl } from "@/hooks/use-object-url";
import { Avatar, AvatarImage } from "./ui/avatar";

export default function FileItemAvatar({ file }: { file: FileItem }) {
  const objectUrl = useObjectUrl(file.file);

  return (
    <Avatar className="h-10 w-10 rounded-md">
      <AvatarImage src={objectUrl} alt={file.name} className="object-cover" />
    </Avatar>
  );
}
