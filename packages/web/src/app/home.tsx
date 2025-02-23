import Thumbnail from "@/components/thumbnail";

export default function Home() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Thumbnail
          src={"20250126_0238.jpg"}
          isAboveFold
          originalWidth={6034}
          originalHeight={3729}
          fit="cover"
        />
        <Thumbnail
          src={"20250126_0084.jpg"}
          isAboveFold
          originalWidth={6034}
          originalHeight={3729}
          fit="cover"
        />
        <Thumbnail
          src={"20250126_0084.jpg"}
          isAboveFold
          originalWidth={6034}
          originalHeight={3729}
          fit="cover"
        />

        <Thumbnail
          src={"DSCF7406.jpg"}
          isAboveFold
          originalWidth={5947}
          originalHeight={3671}
          fit="cover"
          className="md:col-span-3"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Thumbnail
          src={"DSCF7229.jpg"}
          isAboveFold
          originalWidth={871}
          originalHeight={1411}
          fit="cover"
          className=""
        />
        <Thumbnail
          src={"DSCF7128.jpg"}
          isAboveFold
          originalWidth={4000}
          originalHeight={4000}
          fit="cover"
          className=""
        />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </>
  );
}
