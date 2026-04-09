import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import AuthBootstrap from "./components/AuthBootstrap.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </BrowserRouter>
  );
}