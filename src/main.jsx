import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { TeamProvider } from "./context/TeamContext";
import { ProjectProvider } from "./context/ProjectContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TeamProvider>
          <ProjectProvider>
            <App />
          </ProjectProvider>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
