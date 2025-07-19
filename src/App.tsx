
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import Customize from "./pages/Customize";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import SharedCard from "./pages/SharedCard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/customize" element={<Customize />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/shared/:id" element={<SharedCard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
