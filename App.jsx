// © 2026 LINQR — linqr.global — All Rights Reserved
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/b7k9f2-register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Portal from "./pages/Portal.jsx";
import DynamicListing from "./pages/DynamicListing.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/b7k9f2-register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/portal/*" element={<Portal />} />
        <Route path="/:slug" element={<DynamicListing />} />
        <Route
          path="*"
          element={
            <div style={{ padding: 40, fontSize: 20, color: "#fff", background: "#0a0a0a", minHeight: "100vh" }}>
              Page not found.
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
