import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import AdminLayout from "@/components/layouts/AdminLayout";
import AgentLayout from "@/components/layouts/AgentLayout";
import CustomerLayout from "@/components/layouts/CustomerLayout";

// Pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import AssessmentForm from "@/pages/AssessmentForm";
import AdminRegister from "@/pages/AdminRegister";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminAgents from "@/pages/admin/AdminAgents";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminProviders from "@/pages/admin/AdminProviders";
import AdminCompartments from "@/pages/admin/AdminCompartments";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminAssessments from "@/pages/admin/AdminAssessments";
import AdminLinks from "@/pages/admin/AdminLinks";
import AdminResponses from "@/pages/admin/AdminResponses";
import AdminAudit from "@/pages/admin/AdminAudit";

// Agent pages
import AgentDashboard from "@/pages/agent/AgentDashboard";
import AgentCustomers from "@/pages/agent/AgentCustomers";

// Customer pages
import CustomerDashboard from "@/pages/customer/CustomerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              <Route path="/assess/:token" element={<AssessmentForm />} />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="agents" element={<AdminAgents />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="providers" element={<AdminProviders />} />
                <Route path="compartments" element={<AdminCompartments />} />
                <Route path="questions" element={<AdminQuestions />} />
                <Route path="assessments" element={<AdminAssessments />} />
                <Route path="links" element={<AdminLinks />} />
                <Route path="responses" element={<AdminResponses />} />
                <Route path="audit" element={<AdminAudit />} />
              </Route>

              {/* Agent */}
              <Route
                path="/agent"
                element={
                  <ProtectedRoute allowedRoles={["AGENT"]}>
                    <AgentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AgentDashboard />} />
                <Route path="customers" element={<AgentCustomers />} />
              </Route>

              {/* Customer */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                    <CustomerLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CustomerDashboard />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
