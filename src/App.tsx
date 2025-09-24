// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoutes";
import LoginPage from "./LoginPage";
import Dashboard from "./Dasboard";
import { AuthProvider } from "./context/useAuth";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/theme-provider";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
