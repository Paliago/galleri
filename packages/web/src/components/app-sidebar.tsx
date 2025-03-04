import * as React from "react";
import {
  BookOpen,
  GalleryThumbnails,
  ImagePlus,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Pictures",
      url: "/gallerist/pictures",
      icon: ImagePlus,
      isActive: true,
      items: [
        {
          title: "Upload",
          url: "/gallerist/pictures/upload",
        },
        {
          title: "Favorites",
          url: "/gallerist/pictures/favorites",
          disabled: true,
        },
        {
          title: "Trash",
          url: "/gallerist/pictures/trash",
          disabled: true,
        },
      ],
    },
    {
      title: "Albums",
      url: "/gallerist/albums",
      icon: BookOpen,
      items: [
        {
          title: "Create",
          url: "/gallerist/albums/create",
        },
      ],
    },
    {
      title: "Settings",
      url: "/gallerist/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/gallerist/settings",
          disabled: true,
        },
        {
          title: "Users",
          url: "/gallerist/settings/users",
          disabled: true,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();

  // Add isActive property based on current pathname
  const navMainWithActive = data.navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      item.items?.some((subItem) => pathname === subItem.url),
    items: item.items?.map((subItem) => ({
      ...subItem,
      isActive: pathname === subItem.url,
    })),
  }));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Gallery</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/gallery">
                  <GalleryThumbnails />
                  <span>Go to Gallery</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
