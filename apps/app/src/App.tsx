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
const Onboarding = lazy(() =>
  import("./pages/Onboarding").then((module) => ({
    default: module.Onboarding,
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
const DigitalServices = lazy(() =>
  import("./pages/DigitalServices").then((module) => ({
    default: module.DigitalServices,
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
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/real-estate"
                  element={<Navigate to="/real-estate/buy" replace />}
                />
                <Route path="/real-estate/buy" element={<RealEstate mode="buy" />} />
                <Route path="/real-estate/rent" element={<RealEstate mode="rent" />} />
                <Route path="/real-estate/sell" element={<RealEstate mode="sell" />} />
                <Route path="/real-estate/list" element={<PropertyListing />} />
                <Route path="/real-estate/valuation" element={<PropertyValuation />} />
                <Route path="/real-estate/:id" element={<PropertyDetail />} />
                <Route path="/home-services" element={<HomeServices />} />
                <Route
                  path="/home-services/measurement"
                  element={<MeasurementBooking />}
                />
                <Route path="/home-services/documents" element={<Navigate to="/digital-services/id-updates" replace />} />
                <Route path="/home-services/printouts" element={<Navigate to="/digital-services/printouts" replace />} />
                <Route path="/home-services/hs-documents" element={<Navigate to="/digital-services/id-updates" replace />} />
                <Route path="/home-services/hs-printouts" element={<Navigate to="/digital-services/printouts" replace />} />
                <Route path="/home-services/interiors" element={<Interiors />} />
                <Route path="/home-services/:serviceId" element={<HomeServiceDetail />} />
                <Route path="/digital-services" element={<DigitalServices />} />
                <Route
                  path="/digital-services/id-updates"
                  element={<DocumentServices />}
                />
                <Route
                  path="/digital-services/printouts"
                  element={<Printouts />}
                />
                <Route path="/jobs/:id" element={<JobDetail />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
