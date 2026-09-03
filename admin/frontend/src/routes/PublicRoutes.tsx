import { Route, Routes } from "react-router-dom";

import Home from "@/pages/public/home/Home";
import About from "@/pages/public/about/About";
import TestRoutes from "@/routes/TestRoutes";
import NotFound from "@/pages/NotFound";

export default function PublicRoutes() {
  return (
    <Routes>
      {/* 1. PUBLIC ROUTES */}
      <Route path="/">
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* 2. AUTH ROUTES */}

      {/* 3. BUSINESS ROUTES */}

      {/* 4. ADMIN ROUTES */}

      {/* 5. TEST ROUTES */}
      <Route path="/test/*" element={<TestRoutes />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
