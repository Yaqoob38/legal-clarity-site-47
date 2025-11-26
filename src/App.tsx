import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import Calendar from "./pages/Calendar";
import TaskDetail from "./pages/TaskDetail";
import NotFound from "./pages/NotFound";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminRedirect from "./components/AdminRedirect";
import AdminSignIn from "./pages/admin/AdminSignIn";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNewCase from "./pages/admin/AdminNewCase";
import AdminCaseDetail from "./pages/admin/AdminCaseDetail";
import AdminEditCase from "./pages/admin/AdminEditCase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<AdminRedirect />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<SignIn />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/tasks" 
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/task/:taskId" 
              element={
                <ProtectedRoute>
                  <TaskDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route path="/admin/signin" element={<AdminSignIn />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/cases/new"
              element={
                <AdminProtectedRoute>
                  <AdminNewCase />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/cases/:caseId"
              element={
                <AdminProtectedRoute>
                  <AdminCaseDetail />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/cases/:caseId/edit"
              element={
                <AdminProtectedRoute>
                  <AdminEditCase />
                </AdminProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
