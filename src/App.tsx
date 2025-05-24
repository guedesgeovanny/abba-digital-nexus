
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Contacts from "./pages/Contacts";
import CRM from "./pages/CRM";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-abba-black">
      <AppSidebar />
      <main className="flex-1">
        <div className="lg:hidden p-4 border-b border-abba-gray">
          <SidebarTrigger className="text-abba-green" />
        </div>
        <ThemeToggle />
        {children}
      </main>
    </div>
  </SidebarProvider>
);

const App = () => {
  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/agents" 
              element={
                <AuthenticatedLayout>
                  <Agents />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/contacts" 
              element={
                <AuthenticatedLayout>
                  <Contacts />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/crm" 
              element={
                <AuthenticatedLayout>
                  <CRM />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <AuthenticatedLayout>
                  <Settings />
                </AuthenticatedLayout>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
