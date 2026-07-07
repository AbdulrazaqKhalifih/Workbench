import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { TeamProvider } from "./context/TeamContext";
import { ProjectProvider } from "./context/ProjectContext";
import { TaskProvider } from "./context/TaskContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TeamProvider>
          <ProjectProvider>
            <TaskProvider>
              <App />
            </TaskProvider>
          </ProjectProvider>
        </TeamProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
