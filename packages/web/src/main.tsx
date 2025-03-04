import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import UploadPage from "./app/upload.tsx";
import LayoutGallerist from "./app/layout-gallerist";
import { ThemeProvider } from "./components/theme-provider.tsx";
import "./index.css";
import ManagementPage from "./app/manage.tsx";
import GalleryPage from "./app/gallery.tsx";
import LayoutGallery from "./app/layout-gallery.tsx";
import AlbumManagementPage from "./app/albums.tsx";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: just no
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="gallery" element={<LayoutGallery />}>
              <Route index element={<GalleryPage />} />
            </Route>
            <Route path="gallerist" element={<LayoutGallerist />}>
              <Route
                index
                element={<Navigate to="/gallerist/pictures" replace />}
              />

              <Route path="pictures">
                <Route index element={<ManagementPage />} />
                <Route path="upload" element={<UploadPage />} />
              </Route>

              <Route path="albums">
                <Route index element={<AlbumManagementPage />} />
                <Route path="create" element={<UploadPage />} />
              </Route>
            </Route>
            <Route
              path="*"
              element={<Navigate to="/gallerist/pictures" replace />}
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
