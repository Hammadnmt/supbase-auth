"use client";

import { useState } from "react";
import { locationChannel, supabase } from "./libs/supabase";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/context/theme-provider";

export default function AuthPage() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);

  // login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // signup state
  const [signupData, setSignupData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(loginData);
      if (error) {
        toast.error(error.message);
        return;
      } else toast.success("Logged in successfully");
      locationChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("subscribed to location channel");
        }
      });
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      const { status } = await supabase.from("profiles").insert({
        id: data.user?.id,
        phone: signupData.phone,
        full_name: signupData.fullname,
      });
      if (status !== 201) toast.error("Error creating profile");
      else toast.success(`Signed up successfully ${data.user?.email}`);
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors ${
        theme === "dark" ? "bg-black" : "bg-gray-100"
      }`}
    >
      <Card
        className={`w-full max-w-md shadow-xl border ${
          theme === "dark" ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"
        }`}
      >
        <CardHeader>
          <CardTitle
            className={`text-center text-2xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="mt-4 space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Login"}
              </Button>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup" className="mt-4 space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={signupData.fullname}
                onChange={(e) => setSignupData({ ...signupData, fullname: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
              />
              <Button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-neutral-200"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Sign Up"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
