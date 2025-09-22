import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./libs/supabase";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    console.log("Logging in with:", { email, password });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Error logging in:", error.message);
      alert("Login failed: " + error.message);
    } else {
      console.log("Login successful:", data);
      alert("Login successful!");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loading) {
      console.log("Loading...");
    }
  }, [loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow-lg bg-gray-800">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
