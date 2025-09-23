// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoutes";
import LoginPage from "./LoginPage";
import Dashboard from "./Dasboard";
import { AuthProvider } from "./context/useAuth";

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;
