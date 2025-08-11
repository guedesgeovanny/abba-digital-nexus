
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";

import Connections2 from "./pages/Connections2";

import Contacts from "./pages/Contacts";
import CRM from "./pages/CRM";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <ThemeToggle />
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const App = () => {
  // Apply dark mode

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Dashboard />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/connections2" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Connections2 />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contacts" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Contacts />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/crm" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <CRM />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Chat />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <Settings />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
