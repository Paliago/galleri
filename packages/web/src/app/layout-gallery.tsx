import { cn } from "@/lib/utils";
import { Outlet } from "react-router";

export default function LayoutGallery() {
  const darkMode = true; // should be a hook and change based on album

  return (
    <main
      className={cn(
        "min-h-screen py-8 max-w-[120rem] mx-auto p-6 md:p-8 font-sans",
        darkMode ? "bg-gray-900" : "bg-amber-50",
      )}
    >
      <Outlet />
    </main>
  );
}
