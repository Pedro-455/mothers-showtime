import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/b7k9f2-register.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/b7k9f2-register" element={<Register />} />
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
