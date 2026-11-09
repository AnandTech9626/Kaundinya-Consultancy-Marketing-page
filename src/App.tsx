import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { StaffProtectedRoute } from "./components/StaffProtectedRoute";
import { StaffAuthProvider, useStaffAuth } from "./lib/staff-auth";
import { DailyTasks } from "./pages/DailyTasks";
import { DigitalServicesAdmin } from "./pages/DigitalServicesAdmin";
import { HomeServicesAdmin } from "./pages/HomeServicesAdmin";
import { InsuranceAdmin } from "./pages/InsuranceAdmin";
import { LoansAdmin } from "./pages/LoansAdmin";
import { ModuleRequests } from "./pages/ModuleRequests";
import { RealEstateProperties } from "./pages/RealEstateProperties";
import { RequestsAdmin } from "./pages/RequestsAdmin";
import { StaffLogin } from "./pages/StaffLogin";
import { StaffSetup } from "./pages/StaffSetup";

function HomeRedirect() {
  const { staff } = useStaffAuth();
  return (
    <Navigate
      to={staff?.role === "partner" ? "/daily-tasks" : "/requests"}
      replace
    />
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Routes>
        <Route path="/login" element={<StaffLogin />} />
        <Route element={<StaffProtectedRoute />}>
          <Route path="/setup" element={<StaffSetup />} />
          <Route element={<AppShell />}>
            <Route index element={<HomeRedirect />} />
            <Route path="/daily-tasks" element={<DailyTasks />} />
            <Route path="/requests" element={<RequestsAdmin />} />
            <Route path="/real-estate" element={<RealEstateProperties />} />
            <Route
              path="/real-estate/requests"
              element={
                <ModuleRequests
                  category="Real Estate"
                  moduleLabel="Real Estate"
                  modulePath="/real-estate"
                />
              }
            />
            <Route path="/home-services" element={<HomeServicesAdmin />} />
            <Route
              path="/home-services/requests"
              element={
                <ModuleRequests
                  category="Property Management & Home Services"
                  moduleLabel="Home Services"
                  modulePath="/home-services"
                />
              }
            />
            <Route path="/insurance" element={<InsuranceAdmin />} />
            <Route
              path="/insurance/requests"
              element={
                <ModuleRequests
                  category="Insurance"
                  moduleLabel="Insurance"
                  modulePath="/insurance"
                />
              }
            />
            <Route path="/loans" element={<LoansAdmin />} />
            <Route
              path="/digital-services"
              element={<DigitalServicesAdmin />}
            />
          </Route>
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StaffAuthProvider>
        <AppRoutes />
      </StaffAuthProvider>
    </BrowserRouter>
  );
}
