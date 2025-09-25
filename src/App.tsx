// App.tsx
import { BrowserRouter, Routes, Route } from "react-router";

import { ProtectedRoute } from "./ProtectedRoutes";
import LoginPage from "./LoginPage";
import Dashboard from "./Dasboard";
import { AuthProvider } from "./context/useAuth";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/theme-provider";
import Map from "./pages/Map";
import { RealtimeProvider } from "./context/real-time-provider";

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
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
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <Map />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </ThemeProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App;
