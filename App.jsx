import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/b7k9f2-register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CorvetteDemo from "./pages/CorvettDemo.jsx";
import CadillacDemo from "./pages/CadillacDemo.jsx";
import YukonDemo from "./pages/YukonDemo.jsx";
import HarleyDemo from "./pages/HarleyDemo.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/b7k9f2-register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/corvette-z06" element={<CorvetteDemo />} />
        <Route path="/cadillac-lyriq" element={<CadillacDemo />} />
        <Route path="/gmc-yukon" element={<YukonDemo />} />
        <Route path="/harley-street-glide" element={<HarleyDemo />} />
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
