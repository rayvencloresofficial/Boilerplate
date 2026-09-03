import React from "react";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "@/utils/ScrollToTop";
import { AuthProvider } from "./context/AuthProvider";
import PublicRoutes from "./routes/PublicRoutes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <PublicRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
