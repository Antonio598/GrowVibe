import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@fontsource/bricolage-grotesque/400.css";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { AppRouter } from "./routes/router";
import { AuthProvider } from "./store/auth";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 15_000 } },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
      <Toaster richColors position="top-right" toastOptions={{ style: { fontFamily: "Inter, sans-serif" } }} />
    </QueryClientProvider>
  </React.StrictMode>,
);
