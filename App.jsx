import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/b7k9f2-register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CorvetteDemo from "./pages/CorvettDemo.jsx";
import CadillacDemo from "./pages/CadillacDemo.jsx";
import YukonDemo from "./pages/YukonDemo.jsx";
import HarleyDemo from "./pages/HarleyDemo.jsx";
import AstonDBX707 from "./pages/AstonDBX707.jsx";
import AstonDB12S from "./pages/AstonDB12S.jsx";
import RayWhiteDemo from "./pages/RayWhiteDemo.jsx";
import RwHOW45015 from "./pages/RwHOW45015.jsx";
import RwDMR31747 from "./pages/RwDMR31747.jsx";
import RwHOW45506 from "./pages/RwHOW45506.jsx";

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
        <Route path="/aston-dbx707" element={<AstonDBX707 />} />
        <Route path="/aston-db12s" element={<AstonDB12S />} />
        <Route path="/ray-white-karaka" element={<RayWhiteDemo />} />
        <Route path="/rw-HOW45015" element={<RwHOW45015 />} />
        <Route path="/rw-DMR31747" element={<RwDMR31747 />} />
        <Route path="/rw-HOW45506" element={<RwHOW45506 />} />
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
