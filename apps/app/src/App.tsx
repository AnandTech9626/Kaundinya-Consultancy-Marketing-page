import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "@kaundinya/ui";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { AuthCallback } from "./pages/AuthCallback";

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const Requests = lazy(() =>
  import("./pages/Requests").then((module) => ({ default: module.Requests }))
);
const RequestDetail = lazy(() =>
  import("./pages/RequestDetail").then((module) => ({
    default: module.RequestDetail,
  }))
);
const Services = lazy(() =>
  import("./pages/Services").then((module) => ({ default: module.Services }))
);
const ServiceDetail = lazy(() =>
  import("./pages/ServiceDetail").then((module) => ({
    default: module.ServiceDetail,
  }))
);
const Profile = lazy(() =>
  import("./pages/Profile").then((module) => ({ default: module.Profile }))
);
const Notifications = lazy(() =>
  import("./pages/Notifications").then((module) => ({
    default: module.Notifications,
  }))
);
const RealEstate = lazy(() =>
  import("./pages/RealEstate").then((module) => ({ default: module.RealEstate }))
);
const PropertyDetail = lazy(() =>
  import("./pages/PropertyDetail").then((module) => ({
    default: module.PropertyDetail,
  }))
);
const PropertyListing = lazy(() =>
  import("./pages/PropertyListing").then((module) => ({
    default: module.PropertyListing,
  }))
);
const PropertyValuation = lazy(() =>
  import("./pages/PropertyValuation").then((module) => ({
    default: module.PropertyValuation,
  }))
);
const HomeServices = lazy(() =>
  import("./pages/HomeServices").then((module) => ({
    default: module.HomeServices,
  }))
);
const HomeServiceDetail = lazy(() =>
  import("./pages/HomeServiceDetail").then((module) => ({
    default: module.HomeServiceDetail,
  }))
);
const MeasurementBooking = lazy(() =>
  import("./pages/MeasurementBooking").then((module) => ({
    default: module.MeasurementBooking,
  }))
);
const JobTracker = lazy(() =>
  import("./pages/JobTracker").then((module) => ({
    default: module.JobTracker,
  }))
);
const JobDetail = lazy(() =>
  import("./pages/JobDetail").then((module) => ({ default: module.JobDetail }))
);
const DocumentServices = lazy(() =>
  import("./pages/DocumentServices").then((module) => ({
    default: module.DocumentServices,
  }))
);
const Printouts = lazy(() =>
  import("./pages/Printouts").then((module) => ({ default: module.Printouts }))
);
const Interiors = lazy(() =>
  import("./pages/Interiors").then((module) => ({ default: module.Interiors }))
);
const Insurance = lazy(() =>
  import("./pages/Insurance").then((module) => ({ default: module.Insurance }))
);
const HealthInsurance = lazy(() =>
  import("./pages/HealthInsurance").then((module) => ({
    default: module.HealthInsurance,
  }))
);
const MotorInsurance = lazy(() =>
  import("./pages/MotorInsurance").then((module) => ({
    default: module.MotorInsurance,
  }))
);
const PolicyVault = lazy(() =>
  import("./pages/PolicyVault").then((module) => ({
    default: module.PolicyVault,
  }))
);
const Loans = lazy(() =>
  import("./pages/Loans").then((module) => ({ default: module.Loans }))
);
const LoanApply = lazy(() =>
  import("./pages/LoanApply").then((module) => ({ default: module.LoanApply }))
);
const LoanDetail = lazy(() =>
  import("./pages/LoanDetail").then((module) => ({ default: module.LoanDetail }))
);
const CreditHealth = lazy(() =>
  import("./pages/CreditHealth").then((module) => ({
    default: module.CreditHealth,
  }))
);

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Spinner className="w-6 h-6 text-gold" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
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
                <Route
                  path="/home-services/measurement"
                  element={<MeasurementBooking />}
                />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
