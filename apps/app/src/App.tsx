import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";
import { Dashboard } from "./pages/Dashboard";
import { Requests } from "./pages/Requests";
import { RequestDetail } from "./pages/RequestDetail";
import { Services } from "./pages/Services";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Profile } from "./pages/Profile";
import { Notifications } from "./pages/Notifications";
import { RealEstate } from "./pages/RealEstate";
import { PropertyDetail } from "./pages/PropertyDetail";
import { PropertyListing } from "./pages/PropertyListing";
import { PropertyValuation } from "./pages/PropertyValuation";
import { HomeServices } from "./pages/HomeServices";
import { HomeServiceDetail } from "./pages/HomeServiceDetail";
import { MeasurementBooking } from "./pages/MeasurementBooking";
import { JobTracker } from "./pages/JobTracker";
import { JobDetail } from "./pages/JobDetail";
import { DocumentServices } from "./pages/DocumentServices";
import { Printouts } from "./pages/Printouts";
import { Interiors } from "./pages/Interiors";
import { Insurance } from "./pages/Insurance";
import { HealthInsurance } from "./pages/HealthInsurance";
import { MotorInsurance } from "./pages/MotorInsurance";
import { PolicyVault } from "./pages/PolicyVault";
import { Loans } from "./pages/Loans";
import { LoanApply } from "./pages/LoanApply";
import { LoanDetail } from "./pages/LoanDetail";
import { CreditHealth } from "./pages/CreditHealth";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/requests/:id" element={<RequestDetail />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/real-estate" element={<RealEstate />} />
              <Route path="/real-estate/list" element={<PropertyListing />} />
              <Route path="/real-estate/valuation" element={<PropertyValuation />} />
              <Route path="/real-estate/:id" element={<PropertyDetail />} />
              <Route path="/home-services" element={<HomeServices />} />
              <Route path="/home-services/measurement" element={<MeasurementBooking />} />
              <Route path="/home-services/documents" element={<DocumentServices />} />
              <Route path="/home-services/printouts" element={<Printouts />} />
              <Route path="/home-services/interiors" element={<Interiors />} />
              <Route path="/home-services/:serviceId" element={<HomeServiceDetail />} />
              <Route path="/jobs" element={<JobTracker />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/insurance/health" element={<HealthInsurance />} />
              <Route path="/insurance/motor" element={<MotorInsurance />} />
              <Route path="/insurance/policies" element={<PolicyVault />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/loans/apply" element={<LoanApply />} />
              <Route path="/loans/credit-health" element={<CreditHealth />} />
              <Route path="/loans/applications/:id" element={<LoanDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
