import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Register from "./Register";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<App />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
