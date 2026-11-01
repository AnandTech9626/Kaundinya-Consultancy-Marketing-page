import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { StaffProtectedRoute } from "./components/StaffProtectedRoute";
import { StaffAuthProvider } from "./lib/staff-auth";
import { Dashboard } from "./pages/Dashboard";
import { HomeServicesAdmin } from "./pages/HomeServicesAdmin";
import { RealEstateProperties } from "./pages/RealEstateProperties";
import { RequestsAdmin } from "./pages/RequestsAdmin";
import { StaffLogin } from "./pages/StaffLogin";
import { StaffSetup } from "./pages/StaffSetup";

export default function App() {
  return (
    <BrowserRouter>
      <StaffAuthProvider>
        <Routes>
          <Route path="/login" element={<StaffLogin />} />
          <Route element={<StaffProtectedRoute />}>
            <Route path="/setup" element={<StaffSetup />} />
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/requests" element={<RequestsAdmin />} />
              <Route path="/real-estate" element={<RealEstateProperties />} />
              <Route path="/home-services" element={<HomeServicesAdmin />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </StaffAuthProvider>
    </BrowserRouter>
  );
}
