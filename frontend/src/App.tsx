import { BrowserRouter } from "react-router-dom";

import React from "react";
import ScrollToTop from "@/utils/ScrollToTop";
import PublicRoutes from "./routes/PublicRoutes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PublicRoutes />
    </BrowserRouter>
  );
};

export default App;
