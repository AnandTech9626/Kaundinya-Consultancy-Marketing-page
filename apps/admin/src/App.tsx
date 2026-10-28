import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "@kaundinya/ui";
import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./components/AppShell";
import { Login } from "./pages/Login";

const Overview = lazy(() =>
  import("./pages/Overview").then((module) => ({ default: module.Overview }))
);
const Enquiries = lazy(() =>
  import("./pages/Enquiries").then((module) => ({ default: module.Enquiries }))
);
const EnquiryDetail = lazy(() =>
  import("./pages/EnquiryDetail").then((module) => ({
    default: module.EnquiryDetail,
  }))
);
const Clients = lazy(() =>
  import("./pages/Clients").then((module) => ({ default: module.Clients }))
);
const Requests = lazy(() =>
  import("./pages/Requests").then((module) => ({ default: module.Requests }))
);
const Pipeline = lazy(() =>
  import("./pages/Pipeline").then((module) => ({ default: module.Pipeline }))
);
const Properties = lazy(() =>
  import("./pages/Properties").then((module) => ({ default: module.Properties }))
);
const Valuations = lazy(() =>
  import("./pages/Valuations").then((module) => ({ default: module.Valuations }))
);
const SiteVisits = lazy(() =>
  import("./pages/SiteVisits").then((module) => ({ default: module.SiteVisits }))
);
const Dispatch = lazy(() =>
  import("./pages/Dispatch").then((module) => ({ default: module.Dispatch }))
);
const Renewals = lazy(() =>
  import("./pages/Renewals").then((module) => ({ default: module.Renewals }))
);
const Team = lazy(() =>
  import("./pages/Team").then((module) => ({ default: module.Team }))
);
const Services = lazy(() =>
  import("./pages/Services").then((module) => ({ default: module.Services }))
);
const Notifications = lazy(() =>
  import("./pages/Notifications").then((module) => ({
    default: module.Notifications,
  }))
);
const Settings = lazy(() =>
  import("./pages/Settings").then((module) => ({ default: module.Settings }))
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
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/overview" element={<Overview />} />
                <Route path="/enquiries" element={<Enquiries />} />
                <Route path="/enquiries/:id" element={<EnquiryDetail />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/pipeline" element={<Pipeline />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/valuations" element={<Valuations />} />
                <Route path="/site-visits" element={<SiteVisits />} />
                <Route path="/dispatch" element={<Dispatch />} />
                <Route path="/renewals" element={<Renewals />} />
                <Route path="/team" element={<Team />} />
                <Route path="/services" element={<Services />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
