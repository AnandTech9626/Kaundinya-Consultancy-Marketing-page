import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Spinner } from "@kaundinya/ui";
import { AuthProvider } from "./lib/auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
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
const InsuranceSupport = lazy(() =>
  import("./pages/InsuranceSupport").then((module) => ({
    default: module.InsuranceSupport,
  }))
);
const RequestDetail = lazy(() =>
  import("./pages/RequestDetail").then((module) => ({
    default: module.RequestDetail,
  }))
);
const Loans = lazy(() =>
  import("./pages/Loans").then((module) => ({ default: module.Loans }))
);
const LoanProduct = lazy(() =>
  import("./pages/LoanProduct").then((module) => ({
    default: module.LoanProduct,
  }))
);
const LoanSupport = lazy(() =>
  import("./pages/LoanSupport").then((module) => ({
    default: module.LoanSupport,
  }))
);
function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Spinner className="w-6 h-6 text-brand" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
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
                <Route path="/insurance" element={<Insurance />} />
                <Route path="/insurance/health" element={<HealthInsurance />} />
                <Route path="/insurance/motor" element={<MotorInsurance />} />
                <Route path="/insurance/policies" element={<PolicyVault />} />
                <Route path="/insurance/support" element={<InsuranceSupport />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/loans/support" element={<LoanSupport />} />
                <Route path="/loans/:product" element={<LoanProduct />} />
                <Route
                  path="/loans/apply"
                  element={<Navigate to="/loans" replace />}
                />
                <Route
                  path="/loans/credit-health"
                  element={<Navigate to="/loans/support" replace />}
                />
                <Route
                  path="/loans/applications"
                  element={<Navigate to="/loans" replace />}
                />
                <Route
                  path="/loans/applications/:id"
                  element={<Navigate to="/loans" replace />}
                />
                <Route path="/requests/:id" element={<RequestDetail />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
