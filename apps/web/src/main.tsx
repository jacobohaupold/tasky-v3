import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { AuthProvider } from "@/providers/AuthProvider";
import App from "./App";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "8px",
                  fontFamily: "Inter Variable, Inter, sans-serif",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
                error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  </StrictMode>
);
