import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";
import { Overview } from "./pages/Overview";
import { Enquiries } from "./pages/Enquiries";
import { EnquiryDetail } from "./pages/EnquiryDetail";
import { Clients } from "./pages/Clients";
import { Requests } from "./pages/Requests";
import { Team } from "./pages/Team";
import { Services } from "./pages/Services";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/overview" element={<Overview />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/enquiries/:id" element={<EnquiryDetail />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/team" element={<Team />} />
              <Route path="/services" element={<Services />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
