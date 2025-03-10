import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAlbum } from "@/hooks/use-create-album";
import { Album } from "@galleri/core/album";
import { AnyFieldApi, useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(", ")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export default function AlbumCreatePage() {
  const { mutate: createAlbum } = useCreateAlbum();
  const navigate = useNavigate();

  const schema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    albumCover: z.string().optional(),
    styling: z.object({
      borderRadius: z.union([
        z.literal("none"),
        z.literal("sm"),
        z.literal("md"),
        z.literal("lg"),
        z.literal("xl"),
        z.literal("full"),
      ]),
      dark: z.boolean(),
    }),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      styling: {
        borderRadius: "lg" as Album.Radius,
        dark: false,
      },
    } as Album.CreateAlbum,
    validators: {
      onChange: schema,
    },
    onSubmit: ({ value }) => {
      const res = createAlbum(value);
      navigate(`/gallerist/albums/${res}`);
    },
  });

  const borderOptions = [
    { value: "none" as Album.Radius, text: "Square" },
    { value: "sm" as Album.Radius, text: "Small radius" },
    { value: "md" as Album.Radius, text: "Medium radius" },
    { value: "lg" as Album.Radius, text: "Large radius" },
    { value: "xl" as Album.Radius, text: "Extra large radius" },
    { value: "full" as Album.Radius, text: "Rounded (do not use this)" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create New Album</h2>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field
          name="name"
          children={(field) => (
            <div>
              <Label>Name</Label>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <div className="flex justify-between space-x-2">
          <form.Field
            name="styling.borderRadius"
            children={(field) => (
              <div className="w-full">
                <Label>Border Radius</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(e) => field.handleChange(e as Album.Radius)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {borderOptions.map((opt) => (
                      <SelectItem
                        value={opt.value as Album.Radius}
                        key={opt.value}
                      >
                        {opt.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />

          <form.Field
            name="styling.dark"
            children={(field) => (
              <div className="w-full">
                <Label>Type of Gallery</Label>
                <Select
                  value={field.state.value ? "true" : "false"}
                  onValueChange={(e) => field.handleChange(Boolean(e))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"false"} key={"false"}>
                      Light
                    </SelectItem>
                    <SelectItem value={"true"} key={"true"}>
                      Dark
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </div>

        <form.Field
          name="description"
          children={(field) => (
            <div>
              <Label>Description</Label>
              <Textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        />

        <div className="mt-8 flex justify-end space-x-2">
          <Button asChild type="button">
            <Link to="/albums">Cancel</Link>
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "..." : "Create Album"}
              </Button>
            )}
          />
        </div>
      </form>
    </div>
  );
}
