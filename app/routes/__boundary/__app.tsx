import { Outlet } from "react-router";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "~/components/Navbar";
import { Toaster } from "~/components/ui/toaster";

function AppContent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  );
}

export default function AppLayout() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
