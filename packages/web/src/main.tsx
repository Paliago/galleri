import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HomePage from "./app/home.tsx";
import UploadPage from "./app/upload.tsx";
import LayoutGallerist from "./app/layout-gallerist";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { OpenImgContextProvider } from "openimg/react";
import "./index.css";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: just no
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OpenImgContextProvider
      getSrc={(args) =>
        `${`${import.meta.env.VITE_API_URL}image/test`}?src=${args.src}&w=${args.width}&h=${args.height}&fit=${args.fit}&format=${args.format}`
      }
    >
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LayoutGallerist />}>
                <Route index element={<HomePage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </OpenImgContextProvider>
  </StrictMode>,
);
