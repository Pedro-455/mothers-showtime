import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/b7k9f2-register.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Entrant registration page */}
        <Route path="/b7k9f2-register" element={<Register />} />
        {/* Admin page */}
        <Route path="/admin" element={<Admin />} />
        {/* Fallback for unknown routes */}
        <Route
          path="*"
          element={
            <div style={{ padding: 40, fontSize: 20 }}>
              Page not found.
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
