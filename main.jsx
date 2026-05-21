import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Register from "./pages/b7k9f2-register.jsx";
import Admin from "./pages/Admin.jsx";

const path = window.location.pathname;

let Page = App;

if (path === "/b7k9f2-register") Page = Register;
if (path === "/admin") Page = Admin;

ReactDOM.createRoot(document.getElementById("root")).render(<Page />);
