import { type ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Ticket,
  ClipboardList,
  CreditCard,
  Truck,
  Users,
  FileText,
  ShieldCheck,
  Settings as SettingsIcon,
  Menu,
  LogOut,
  ExternalLink,
} from "lucide-react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { roles } from "@/data/mock";
import type { PermissionKey } from "@/data/types";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package, permission: "products" },
  { to: "/admin/collections", label: "Collections", icon: Layers, permission: "collections" },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket, permission: "coupons" },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList, permission: "orders" },
  { to: "/admin/payments", label: "Payments", icon: CreditCard, permission: "payments" },
  { to: "/admin/shipping", label: "Shipping", icon: Truck, permission: "shipping" },
  { to: "/admin/customers", label: "Customers", icon: Users, permission: "customers" },
  { to: "/admin/content", label: "Content", icon: FileText, permission: "content" },
  { to: "/admin/team", label: "Team", icon: ShieldCheck, permission: "team" },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon, permission: "settings" },
];

const roleLabel = (role: string) => roles.find((r) => r.key === role)?.label ?? role;

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { hasPermission } = useStore();
  const items = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission));
  return (
    <nav className="flex flex-col gap-1 px-3 py-3">
      {items.map((item) => {
        const active = pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all",
              active
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold"
                : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-amber-700" : "text-slate-400")} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-slate-50/80 border-r border-slate-200 text-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 bg-white">
        <BrandMark size="sm" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavList pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500 bg-white">
        <p className="font-semibold text-slate-700">Store Administration</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Bansal·nx Suite</p>
      </div>
    </div>
  );
}

export function AdminLayout({ title, children }: { title?: string; children: ReactNode }) {
  const { user, isAdmin, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent pathname={pathname} />
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-r border-slate-200 bg-slate-50 p-0 text-slate-800">
                <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="font-display font-semibold text-base sm:text-lg text-slate-900">{title ?? "Admin"}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAdmin && user && (
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold leading-tight text-slate-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] uppercase font-medium tracking-wider text-slate-500">
                  {roleLabel(user.role)}
                </p>
              </div>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50" asChild>
              <Link to="/">
                <ExternalLink className="h-3.5 w-3.5" /> View store
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </Button>
            )}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

/**
 * Client-side guard only. This blocks rendering of the page content in the
 * browser bundle; it is NOT a substitute for server-side authorisation.
 * A real deployment must re-check `isAuthenticated`, the user's role and the
 * requested permission on every API request / route loader on the server.
 */
export function AdminGuard({
  permission,
  children,
}: {
  permission?: PermissionKey;
  children: ReactNode;
}) {
  const { isAuthenticated, isAdmin, user, hasPermission } = useStore();

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="w-full max-w-md border border-border bg-background p-8 text-center">
          <p className="eyebrow text-muted-foreground">Restricted area</p>
          <h1 className="mt-2 text-2xl font-display">Sign in required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You need an admin account to view the Bansal-nx admin console.
          </p>
          <Button asChild variant="luxe" size="luxe" className="mt-6 w-full">
            <Link to="/login?redirect=/admin">
              Go to login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (permission && !hasPermission(permission)) {
    return (
      <AdminLayout title="Access denied">
        <div className="mx-auto max-w-lg border border-border bg-background p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-display">You don't have permission to view this page.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page requires the <span className="font-medium text-foreground">{permission}</span>{" "}
            permission. Your role,{" "}
            <span className="font-medium text-foreground">{roleLabel(user?.role ?? "")}</span>, does
            not include it. Contact a Super Admin if you need access.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-6">
            <Link to="/admin">Back to dashboard</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return <>{children}</>;
}

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

type StatusTone = "success" | "warning" | "info" | "destructive" | "muted";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  info: "border-info/30 bg-info/10 text-info",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status, label }: { status: StatusTone; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", TONE_CLASSES[status])}
    >
      {label}
    </Badge>
  );
}
