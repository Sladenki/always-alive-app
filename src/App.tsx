import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthSheet from "@/components/AuthSheet";
import Index from "./pages/Index.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AuthenticatedGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage />
        <AuthSheet />
      </>
    );
  }
  return (
    <>
      <Index />
      <AuthSheet />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthenticatedGate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
