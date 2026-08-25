import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  ExternalLink,
  Lock,
  LogOut,
  Shield,
  ShieldCheck,
  Store,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/storefront/SiteLayout";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AccountPage } from "@/pages/AccountPage";
import { AdminPage } from "@/pages/AdminPage";

export function DashboardPage() {
  const { isAuthenticated, user, isAdmin, login, logout } = useStore();
  const navigate = useNavigate();

  // For admins, allow seamless toggling between Admin Console and Customer View
  const [adminViewMode, setAdminViewMode] = useState<"admin" | "customer">("admin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  function handleDemoLogin(email: string) {
    setLoading(true);
    setTimeout(() => {
      const res = login(email, "password");
      setLoading(false);
      if (res.ok && res.user) {
        toast.success(`Signed in as ${res.user.firstName} (${res.user.role})`);
      } else {
        toast.error(res.error ?? "Failed to sign in");
      }
    }, 300);
  }

  function handleManualLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const res = login(loginEmail, loginPassword);
      setLoading(false);
      if (res.ok && res.user) {
        toast.success(`Signed in as ${res.user.firstName}`);
      } else {
        toast.error(res.error ?? "Invalid credentials");
      }
    }, 400);
  }

  // 1. GUEST / UNAUTHENTICATED STATE: Clean Minimalist Light Portal Gate
  if (!isAuthenticated || !user) {
    return (
      <SiteLayout>
        <div className="flex min-h-[75vh] items-center justify-center bg-slate-50/50 px-5 py-16">
          <div className="w-full max-w-lg border border-slate-200 bg-white p-8 sm:p-10 shadow-sm rounded-xl">
            <div className="text-center">
              <BrandMark size="md" className="mx-auto" />
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-amber-700">Regal Suite Portal</p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">Account &amp; Management Hub</h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                Access your customer orders or the store administrative console.
              </p>
            </div>

            {/* Quick 1-Click Demo Accounts */}
            <div className="mt-8 border border-slate-200 bg-slate-50/80 p-5 rounded-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                1-Click Demo Access
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleDemoLogin("customer@bansal-nx.com")}
                  className="justify-start gap-2 text-xs font-medium border-slate-200 bg-white hover:bg-slate-100 text-slate-800"
                >
                  <User className="h-3.5 w-3.5 text-amber-700" /> Customer Hub
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleDemoLogin("admin@bansal-nx.com")}
                  className="justify-start gap-2 text-xs font-medium border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" /> Admin Console
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleDemoLogin("orders@bansal-nx.com")}
                  className="justify-start gap-2 text-xs font-medium border-slate-200 bg-white hover:bg-slate-100 text-slate-800"
                >
                  <Users className="h-3.5 w-3.5 text-blue-600" /> Orders Manager
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleDemoLogin("content@bansal-nx.com")}
                  className="justify-start gap-2 text-xs font-medium border-slate-200 bg-white hover:bg-slate-100 text-slate-800"
                >
                  <Store className="h-3.5 w-3.5 text-emerald-600" /> Content Manager
                </Button>
              </div>
            </div>

            {/* Regular Login Form */}
            <form onSubmit={handleManualLogin} className="mt-6 space-y-4">
              <div className="relative flex items-center justify-center border-t border-slate-200 pt-4">
                <span className="bg-white px-3 text-xs font-medium text-slate-400 -mt-6">
                  Or sign in with email
                </span>
              </div>
              <div>
                <label htmlFor="dash-email" className="text-xs font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  id="dash-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm rounded-md focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="dash-pass" className="text-xs font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="dash-pass"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1 w-full border border-slate-200 bg-white px-3 py-2 text-sm rounded-md focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>
              <Button type="submit" variant="luxe" className="w-full font-medium" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
              <Link to="/" className="hover:text-slate-900 transition-colors">
                ← Return to Storefront
              </Link>
              <Link to="/register" className="font-medium text-slate-800 hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  // 2. ADMIN USER: Show Clean Minimalist Light Top Switcher
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50/40">
        {/* Global Multi-Role Switcher Header */}
        <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2.5 text-slate-800 shadow-sm">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-900">Unified Portal</span>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 rounded-md capitalize">
                {user.role.replace(/_/g, " ")} ({user.firstName})
              </Badge>
            </div>

            {/* Quick Switcher Controls */}
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setAdminViewMode("admin")}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    adminViewMode === "admin"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Admin Console
                </button>
                <button
                  type="button"
                  onClick={() => setAdminViewMode("customer")}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                    adminViewMode === "customer"
                      ? "bg-white text-slate-900 shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900",
                  )}
                >
                  Customer View
                </button>
              </div>

              <Button asChild variant="outline" size="sm" className="h-7 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 rounded-md">
                <Link to="/" target="_blank">
                  <Store className="h-3 w-3" /> Storefront
                </Link>
              </Button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/dashboard");
                }}
                className="text-slate-500 hover:text-destructive text-xs transition-colors p-1"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View rendering */}
        {adminViewMode === "admin" ? <AdminPage /> : <AccountPage />}
      </div>
    );
  }

  // 3. REGULAR CUSTOMER USER: Render Full Customer Account Hub
  return <AccountPage />;
}
