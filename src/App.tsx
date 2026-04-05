import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import NotFound from "./pages/NotFound.tsx";
import { initializeCapacitor } from "@/capacitor/init";
import { usePersistedStore } from "@/hooks/usePersistedStore";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ContactsPage = lazy(() => import("./pages/ContactsPage"));
const SmsPage = lazy(() => import("./pages/SmsPage"));
const FilesPage = lazy(() => import("./pages/FilesPage"));
const CallsPage = lazy(() => import("./pages/CallsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ApkBuilderPage = lazy(() => import("./pages/ApkBuilderPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
  </div>
);

const AppContent = () => {
  const loaded = usePersistedStore();

  useEffect(() => {
    initializeCapacitor();
  }, []);

  if (!loaded) return <Loading />;

  return (
    <>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<ApkBuilderPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/sms" element={<SmsPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/calls" element={<CallsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/apk-builder" element={<Navigate to="/" replace />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <BottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
