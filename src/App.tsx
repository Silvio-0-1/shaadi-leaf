
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import Customize from "./pages/Customize";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminDashboardHome } from "./pages/admin/AdminDashboardHome";
import { AdminTemplates } from "./pages/admin/AdminTemplates";
import { AdminTemplateCreator } from "./pages/admin/AdminTemplateCreator";
import { AdminTags } from "./pages/admin/AdminTags";
import { AdminPages } from "./pages/admin/AdminPages";
import { AdminCredits } from "./pages/admin/AdminCredits";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminSettings } from "./pages/admin/AdminSettings";
import SharedCard from "./pages/SharedCard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/customize" element={<Customize />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/admin-old" element={<AdminDashboard />} />
              <Route path="/admin" element={<AdminDashboardHome />} />
              <Route path="/admin/templates" element={<AdminTemplates />} />
              <Route path="/admin/templates/create" element={<AdminTemplateCreator />} />
              <Route path="/admin/tags" element={<AdminTags />} />
              <Route path="/admin/pages" element={<AdminPages />} />
              <Route path="/admin/credits" element={<AdminCredits />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/shared/:id" element={<SharedCard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
