import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  CreditCard,
  ExternalLink,
  PackageSearch,
  Plus,
  Search,
  Ticket,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGuard, AdminLayout, StatusBadge } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderStatusLabels, paymentStatusLabels } from "@/data/mock";
import type { Collection, Order, OrderStatus, Product, Coupon, PermissionKey } from "@/data/types";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { uploadImageRequest } from "@/lib/api/uploads";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type AdminTab =
  | "overview"
  | "orders"
  | "products"
  | "collections"
  | "coupons"
  | "customers"
  | "shipping"
  | "settings";

const TAB_TITLES: Record<AdminTab, string> = {
  overview: "Admin Dashboard",
  orders: "Orders & Fulfilment",
  products: "Products",
  collections: "Collections",
  coupons: "Coupons & Offers",
  customers: "Customers",
  shipping: "Logistics & Delhivery",
  settings: "Store Settings",
};

function tabFromPathname(pathname: string): AdminTab {
  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0];
  if (
    segment === "orders" ||
    segment === "products" ||
    segment === "collections" ||
    segment === "coupons" ||
    segment === "customers" ||
    segment === "shipping" ||
    segment === "settings"
  ) {
    return segment;
  }
  return "overview";
}

export function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabFromPathname(location.pathname);

  function goToTab(tab: AdminTab) {
    navigate(tab === "overview" ? "/admin" : `/admin/${tab}`);
  }

  return (
    <AdminGuard>
      <AdminLayout title={TAB_TITLES[activeTab]}>
        <div className="space-y-8">
          {activeTab === "overview" && <OverviewTab onNavigateTab={goToTab} />}
          {activeTab === "orders" && <OrdersManagerTab />}
          {activeTab === "products" && <ProductsManagerTab />}
          {activeTab === "collections" && <CollectionsManagerTab />}
          {activeTab === "coupons" && <CouponsManagerTab />}
          {activeTab === "customers" && <CustomersManagerTab />}
          {activeTab === "shipping" && <ShippingManagerTab />}
          {activeTab === "settings" && <SettingsManagerTab />}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}

/* =========================================================================
   1. OVERVIEW TAB
   ========================================================================= */
function OverviewTab({ onNavigateTab }: { onNavigateTab: (tab: AdminTab) => void }) {
  const { orders, products, coupons, settings, hasPermission } = useStore();

  const awaitingFulfilment = orders.filter((o) =>
    ["confirmed", "processing", "packed", "ready_for_pickup"].includes(o.status),
  );
  const inTransit = orders.filter((o) =>
    ["shipped", "in_transit", "out_for_delivery"].includes(o.status),
  );
  const delivered = orders.filter((o) => o.status === "delivered");
  const exceptions = orders.filter((o) =>
    ["ndr", "rto", "delivery_failed", "lost"].includes(o.status),
  );

  const needsAttention = orders.filter(
    (o) =>
      ["ndr", "rto"].includes(o.status) ||
      o.payment.status === "failed" ||
      (o.returnRequest && !["refund_completed", "rejected"].includes(o.returnRequest.status)),
  );

  const totalRevenue = orders
    .filter((o) => o.payment.status === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden border border-slate-200/90 bg-gradient-to-r from-white via-amber-50/20 to-slate-50 p-6 rounded-xl shadow-sm text-slate-900">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Executive Overview
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Bansal·nx Operational Suite
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Live orders, logistics pipelines, and store controls in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-medium"
              onClick={() => onNavigateTab("orders")}
            >
              Process Orders ({awaitingFulfilment.length})
            </Button>
            <Button asChild variant="luxe" size="sm">
              <Link to="/products" target="_blank">
                <ExternalLink className="h-3.5 w-3.5" /> View Live Store
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Total Revenue</p>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {formatINR(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">{orders.length} lifetime orders</p>
        </div>
        <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Awaiting Fulfilment</p>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <PackageSearch className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {awaitingFulfilment.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Ready for dispatch</p>
        </div>
        <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">In Transit</p>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {inTransit.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Delhivery network</p>
        </div>
        <div className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Exceptions / NDR</p>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-rose-600">
            {exceptions.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Require attention</p>
        </div>
      </div>

      {/* Needs Attention Queue */}
      {needsAttention.length > 0 && (
        <div className="border border-destructive/40 bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-destructive/5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-destructive">
                Needs Immediate Attention ({needsAttention.length})
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab("orders")}
              className="text-xs"
            >
              Manage All
            </Button>
          </div>
          <p className="px-5 pt-3 text-[11px] uppercase tracking-wider text-muted-foreground sm:hidden">
            Swipe table to see more →
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {needsAttention.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>
                    {["ndr", "rto"].includes(o.status) && (
                      <StatusBadge status="warning" label={`NDR: ${o.status.toUpperCase()}`} />
                    )}
                    {o.payment.status === "failed" && (
                      <StatusBadge status="destructive" label="Payment Failed" />
                    )}
                    {o.returnRequest && (
                      <StatusBadge status="info" label={`Return: ${o.returnRequest.status}`} />
                    )}
                  </TableCell>
                  <TableCell>{formatINR(o.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="luxeOutline" size="sm" onClick={() => onNavigateTab("orders")}>
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Recent Orders
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab("orders")}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800"
          >
            View All ({orders.length}) <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <p className="px-5 pt-3 text-[11px] uppercase tracking-wider text-slate-400 sm:hidden">
          Swipe table to see more →
        </p>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/30">
              <TableHead className="text-xs font-semibold text-slate-500">Order ID</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Items</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Total</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((o) => (
              <TableRow
                key={o.id}
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="font-semibold text-slate-900 text-xs">{o.id}</TableCell>
                <TableCell className="text-xs font-medium text-slate-700">
                  {o.customerName}
                </TableCell>
                <TableCell className="text-xs text-slate-500">{formatDate(o.createdAt)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-slate-500">
                  {o.lines.map((l) => l.name).join(", ")}
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-900">
                  {formatINR(o.total)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-full capitalize font-medium text-xs border-slate-200 bg-slate-50 text-slate-700"
                  >
                    {orderStatusLabels[o.status] || o.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Integrations Grid */}
      <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Integration Pipelines
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Operational status of integrated merchant and delivery providers.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between border border-slate-200 bg-slate-50/50 p-4 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-slate-900">Razorpay Gateway</p>
              <p className="text-[11px] text-slate-500">UPI, Cards, Netbanking</p>
            </div>
            <StatusBadge
              status={settings.razorpayConnected ? "success" : "muted"}
              label={settings.razorpayConnected ? "Active" : "Ready"}
            />
          </div>
          <div className="flex items-center justify-between border border-slate-200 bg-slate-50/50 p-4 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-slate-900">Delhivery Logistics</p>
              <p className="text-[11px] text-slate-500">Surface & Express AWB</p>
            </div>
            <StatusBadge
              status={settings.delhiveryConnected ? "success" : "muted"}
              label={settings.delhiveryConnected ? "Active" : "Ready"}
            />
          </div>
          <div className="flex items-center justify-between border border-slate-200 bg-slate-50/50 p-4 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-slate-900">Transactional Email</p>
              <p className="text-[11px] text-slate-500">Order & Dispatch Alerts</p>
            </div>
            <StatusBadge
              status={settings.emailProviderConnected ? "success" : "muted"}
              label={settings.emailProviderConnected ? "Active" : "Ready"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. ORDERS MANAGER TAB
   ========================================================================= */
function OrdersManagerTab() {
  const { orders, updateOrder } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (
      filter === "awaiting" &&
      !["confirmed", "processing", "packed", "ready_for_pickup"].includes(o.status)
    )
      return false;
    if (filter === "transit" && !["shipped", "in_transit", "out_for_delivery"].includes(o.status))
      return false;
    if (filter === "delivered" && o.status !== "delivered") return false;
    if (filter === "returns" && !o.returnRequest) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    try {
      await updateOrder(orderId, { status: newStatus });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`Order ${orderId} updated to ${orderStatusLabels[newStatus]}`);
    } catch {
      toast.error("Couldn't update that order. Please try again.");
    }
  }

  async function handleApproveReturn(orderId: string) {
    try {
      await updateOrder(orderId, {
        returnRequest: {
          reason: selectedOrder?.returnRequest?.reason ?? "Customer requested return",
          status: "approved",
          requestedAt: selectedOrder?.returnRequest?.requestedAt ?? new Date().toISOString(),
          refundAmount: selectedOrder?.total ?? 0,
        },
      });
      toast.success(`Return approved for order ${orderId}`);
      setSelectedOrder(null);
    } catch {
      toast.error("Couldn't approve that return. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl">Order Fulfilment & Management</h2>
          <p className="text-xs text-muted-foreground">
            Manage order lifecycles, fulfillments, returns, and refunds.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID or customer"
            className="rounded-none pl-9"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Orders", count: orders.length },
          {
            id: "awaiting",
            label: "Awaiting Fulfilment",
            count: orders.filter((o) =>
              ["confirmed", "processing", "packed", "ready_for_pickup"].includes(o.status),
            ).length,
          },
          {
            id: "transit",
            label: "In Transit",
            count: orders.filter((o) =>
              ["shipped", "in_transit", "out_for_delivery"].includes(o.status),
            ).length,
          },
          {
            id: "delivered",
            label: "Delivered",
            count: orders.filter((o) => o.status === "delivered").length,
          },
          {
            id: "returns",
            label: "Return Requests",
            count: orders.filter((o) => Boolean(o.returnRequest)).length,
          },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "border px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer",
              filter === f.id
                ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-xs"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">Order ID</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Total</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Payment</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-xs text-slate-500">
                  No orders match the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((o) => (
                <TableRow
                  key={o.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell className="font-semibold text-slate-900 text-xs">{o.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{o.customerName}</p>
                      <p className="text-[11px] text-slate-500">{o.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDateTime(o.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">
                    {formatINR(o.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-full capitalize text-[11px] font-medium border-slate-200 bg-slate-50 text-slate-700"
                    >
                      {o.payment.status} ({o.payment.method})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[11px] font-semibold capitalize",
                        o.status === "delivered" &&
                          "border-emerald-200 bg-emerald-50 text-emerald-700",
                        ["ndr", "rto", "cancelled"].includes(o.status) &&
                          "border-rose-200 bg-rose-50 text-rose-700",
                        !["delivered", "ndr", "rto", "cancelled"].includes(o.status) &&
                          "border-slate-200 bg-slate-50 text-slate-700",
                      )}
                    >
                      {orderStatusLabels[o.status] || o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(o)}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Detail & Action Modal */}
      {selectedOrder && (
        <Dialog
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-sans font-bold text-xl text-slate-900">
                Order {selectedOrder.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Customer: {selectedOrder.customerName} ({selectedOrder.email}) · Placed on{" "}
                {formatDateTime(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-6">
              {/* Order Items */}
              <div className="border border-border p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Order Lines
                </p>
                <ul className="mt-3 divide-y divide-border">
                  {selectedOrder.lines.map((line, idx) => (
                    <li key={idx} className="flex items-center justify-between py-2 text-sm">
                      <div className="flex items-center gap-3">
                        <img src={line.image} alt={line.name} className="h-10 w-8 object-cover" />
                        <div>
                          <p className="font-medium">{line.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {line.size} · {line.colour} · Qty {line.quantity}
                          </p>
                        </div>
                      </div>
                      <span>{formatINR(line.price * line.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-medium">
                  <span>Total</span>
                  <span>{formatINR(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Updater */}
              <div className="border border-border p-4">
                <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Update Fulfillment Status
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      "confirmed",
                      "processing",
                      "packed",
                      "ready_for_pickup",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ] as OrderStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      className={cn(
                        "border px-3 py-1 text-xs capitalize transition-colors",
                        selectedOrder.status === st
                          ? "border-gold bg-gold text-ink font-medium"
                          : "border-border hover:border-foreground/50",
                      )}
                    >
                      {orderStatusLabels[st] || st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Request Management */}
              {selectedOrder.returnRequest && (
                <div className="border border-gold/50 bg-gold/5 p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-gold-deep font-medium">
                    Return Request Pending
                  </p>
                  <p className="mt-1 text-sm">Reason: {selectedOrder.returnRequest.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    Current status: {selectedOrder.returnRequest.status}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="luxe"
                      size="sm"
                      onClick={() => handleApproveReturn(selectedOrder.id)}
                    >
                      Approve Return &amp; Schedule Reverse Pickup
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* =========================================================================
   3. PRODUCTS & INVENTORY MANAGER TAB
   ========================================================================= */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildVariants(sizes: string[], colours: string[]): Product["variants"] {
  return colours.flatMap((colour) =>
    sizes.map((size) => ({
      id: `new-${colour}-${size}`,
      size,
      colour,
      availability: "available" as const,
    })),
  );
}

interface ProductFormValues {
  name: string;
  slug: string;
  category: string;
  price: string;
  mrp: string;
  images: string;
  shortDescription: string;
  description: string;
  sizes: string;
  colours: string;
  tags: string;
  badge: "none" | "new" | "bestseller" | "exclusive";
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  published: boolean;
}

const emptyProductForm: ProductFormValues = {
  name: "",
  slug: "",
  category: "",
  price: "",
  mrp: "",
  images: "",
  shortDescription: "",
  description: "",
  sizes: "XS, S, M, L, XL",
  colours: "",
  tags: "",
  badge: "none",
  featured: false,
  bestseller: false,
  newArrival: false,
  published: false,
};

function ProductsManagerTab() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: "images") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageRequest(file);
      setForm((f) => ({ ...f, [field]: f[field] ? `${f[field]}\n${url}` : url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Couldn't upload that image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleAvailability(prod: Product) {
    const nextPublished = !prod.published;
    try {
      await saveProduct({ ...prod, published: nextPublished });
      toast.success(`${prod.name} ${nextPublished ? "published to store" : "unpublished"}`);
    } catch {
      toast.error("Couldn't update that product. Please try again.");
    }
  }

  async function handleSavePrice(prod: Product, newPrice: number) {
    try {
      await saveProduct({ ...prod, price: newPrice });
      toast.success(`Updated price for ${prod.name}`);
      setEditingProduct(null);
    } catch {
      toast.error("Couldn't update the price. Please try again.");
    }
  }

  async function handleDelete(prod: Product) {
    if (!window.confirm(`Delete "${prod.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(prod.id);
      toast.success(`${prod.name} deleted`);
    } catch {
      toast.error("Couldn't delete that product. Please try again.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const sizes = splitList(form.sizes);
    const colours = splitList(form.colours);
    if (!form.name.trim() || !sizes.length || !colours.length) return;

    setSaving(true);
    try {
      await saveProduct({
        id: `new-${Date.now()}`,
        slug: form.slug.trim() || slugify(form.name),
        name: form.name.trim(),
        price: Number(form.price) || 0,
        mrp: Number(form.mrp) || Number(form.price) || 0,
        currency: "INR",
        images: splitList(form.images.replace(/\n/g, ",")),
        category: form.category.trim(),
        collections: [],
        tags: splitList(form.tags),
        badge: form.badge === "none" ? null : form.badge,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim() || form.shortDescription.trim(),
        details: [],
        care: [],
        sizes,
        colours,
        variants: buildVariants(sizes, colours),
        featured: form.featured,
        bestseller: form.bestseller,
        newArrival: form.newArrival,
        published: form.published,
        createdAt: new Date().toISOString(),
      });
      toast.success(`${form.name} created`);
      setCreateOpen(false);
      setForm(emptyProductForm);
    } catch {
      toast.error("Couldn't create that product. Please check the slug is unique and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl">Products</h2>
          <p className="text-xs text-muted-foreground">
            Create products, edit pricing, and manage store catalog visibility.
          </p>
        </div>
        <Button variant="luxe" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Product
        </Button>
      </div>

      <div className="border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>MRP</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="h-12 w-10 object-cover" />
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Slug: {p.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-xs">{p.category}</TableCell>
                <TableCell className="text-sm font-medium">{formatINR(p.price)}</TableCell>
                <TableCell className="text-xs text-muted-foreground line-through">
                  {formatINR(p.mrp)}
                </TableCell>
                <TableCell className="text-xs">{p.variants.length} SKU(s)</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(p)}
                    className={cn(
                      "border px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] transition-colors",
                      p.published
                        ? "border-emerald/50 bg-emerald/10 text-emerald"
                        : "border-muted-foreground/40 bg-muted text-muted-foreground",
                    )}
                  >
                    {p.published ? "Live" : "Draft"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="luxeOutline" size="sm" onClick={() => setEditingProduct(p)}>
                      Edit Price
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDelete(p)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {createOpen && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-none border border-border bg-background p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create Product</DialogTitle>
              <DialogDescription>
                Add a new piece to the catalog. You can publish it later.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug === slugify(f.name) ? slugify(e.target.value) : f.slug,
                    }))
                  }
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="p-slug">Slug</Label>
                <Input
                  id="p-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder={slugify(form.name) || "auto-generated-from-name"}
                  className="mt-1 rounded-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="p-category">Category</Label>
                  <Input
                    id="p-category"
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="mt-1 rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="p-badge">Badge</Label>
                  <Select
                    value={form.badge}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, badge: v as ProductFormValues["badge"] }))
                    }
                  >
                    <SelectTrigger id="p-badge" className="mt-1 rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="bestseller">Bestseller</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="p-price">Price (INR)</Label>
                  <Input
                    id="p-price"
                    type="number"
                    required
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="mt-1 rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="p-mrp">MRP (INR)</Label>
                  <Input
                    id="p-mrp"
                    type="number"
                    min="0"
                    value={form.mrp}
                    onChange={(e) => setForm((f) => ({ ...f, mrp: e.target.value }))}
                    placeholder={form.price || "0"}
                    className="mt-1 rounded-none"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="p-short">Short description</Label>
                <Input
                  id="p-short"
                  required
                  value={form.shortDescription}
                  onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="p-desc">Full description</Label>
                <Textarea
                  id="p-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="p-images">Image URLs (one per line)</Label>
                <Textarea
                  id="p-images"
                  rows={3}
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  placeholder="/products/example.jpg"
                  className="mt-1 rounded-none"
                />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-gold-deep hover:underline">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => void handleImageUpload(e, "images")}
                  />
                  {uploading ? "Uploading…" : "+ Upload an image"}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="p-sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="p-sizes"
                    required
                    value={form.sizes}
                    onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                    className="mt-1 rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="p-colours">Colours (comma-separated)</Label>
                  <Input
                    id="p-colours"
                    required
                    value={form.colours}
                    onChange={(e) => setForm((f) => ({ ...f, colours: e.target.value }))}
                    className="mt-1 rounded-none"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="p-tags">Tags (comma-separated)</Label>
                <Input
                  id="p-tags"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="mt-1 rounded-none"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {(["featured", "bestseller", "newArrival", "published"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={form[key]}
                      onCheckedChange={(c) => setForm((f) => ({ ...f, [key]: c === true }))}
                    />
                    <span className="capitalize">{key === "newArrival" ? "New arrival" : key}</span>
                  </label>
                ))}
              </div>
              <Button type="submit" variant="luxe" className="w-full" disabled={saving}>
                {saving ? "Creating…" : "Create Product"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {editingProduct && (
        <Dialog
          open={Boolean(editingProduct)}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        >
          <DialogContent className="max-w-md rounded-none border border-border bg-background p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit Product Pricing</DialogTitle>
              <DialogDescription>{editingProduct.name}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const price = Number((form.elements.namedItem("price") as HTMLInputElement).value);
                if (price > 0) handleSavePrice(editingProduct, price);
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label htmlFor="edit-price">Selling Price (INR)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  defaultValue={editingProduct.price}
                  className="mt-1 rounded-none"
                />
              </div>
              <Button type="submit" variant="luxe" className="w-full">
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* =========================================================================
   4. COLLECTIONS MANAGER TAB
   ========================================================================= */
interface CollectionFormValues {
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  productIds: string[];
  featured: boolean;
  published: boolean;
  order: string;
}

function collectionToForm(c: Collection): CollectionFormValues {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.coverImage,
    productIds: c.productIds,
    featured: c.featured,
    published: c.published,
    order: String(c.order),
  };
}

const emptyCollectionForm: CollectionFormValues = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
  productIds: [],
  featured: false,
  published: false,
  order: "0",
};

function CollectionsManagerTab() {
  const { collections, products, saveCollection, deleteCollection } = useStore();
  const [editing, setEditing] = useState<Collection | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CollectionFormValues>(emptyCollectionForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageRequest(file);
      setForm((f) => ({ ...f, coverImage: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Couldn't upload that image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function openCreate() {
    setForm(emptyCollectionForm);
    setEditing(null);
    setCreateOpen(true);
  }

  function openEdit(c: Collection) {
    setForm(collectionToForm(c));
    setEditing(c);
    setCreateOpen(true);
  }

  async function handleDelete(c: Collection) {
    if (!window.confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    try {
      await deleteCollection(c.id);
      toast.success(`${c.name} deleted`);
    } catch {
      toast.error("Couldn't delete that collection. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await saveCollection({
        id: editing?.id ?? `new-${Date.now()}`,
        slug: form.slug.trim() || slugify(form.name),
        name: form.name.trim(),
        description: form.description.trim(),
        coverImage: form.coverImage.trim(),
        bannerImage: form.coverImage.trim(),
        productIds: form.productIds,
        featured: form.featured,
        published: form.published,
        order: Number(form.order) || 0,
      });
      toast.success(`${form.name} ${editing ? "updated" : "created"}`);
      setCreateOpen(false);
      setEditing(null);
    } catch {
      toast.error("Couldn't save that collection. Please check the slug is unique and try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleProduct(id: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((p) => p !== id)
        : [...f.productIds, id],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl">Collections</h2>
          <p className="text-xs text-muted-foreground">
            Group products into curated collections for the storefront.
          </p>
        </div>
        <Button variant="luxe" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Collection
        </Button>
      </div>

      <div className="border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {c.coverImage && (
                      <img src={c.coverImage} alt={c.name} className="h-12 w-16 object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Slug: {c.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{c.productIds.length}</TableCell>
                <TableCell className="text-xs">{c.featured ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={c.published ? "success" : "muted"}
                    label={c.published ? "Published" : "Draft"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="luxeOutline" size="sm" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleDelete(c)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {createOpen && (
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setEditing(null);
          }}
        >
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-none border border-border bg-background p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing ? "Edit Collection" : "Create Collection"}
              </DialogTitle>
              <DialogDescription>
                {editing ? editing.name : "Group products for a themed storefront edit."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug === slugify(f.name) ? slugify(e.target.value) : f.slug,
                    }))
                  }
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="c-slug">Slug</Label>
                <Input
                  id="c-slug"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder={slugify(form.name) || "auto-generated-from-name"}
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="c-description">Description</Label>
                <Textarea
                  id="c-description"
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label htmlFor="c-cover">Cover image URL</Label>
                <Input
                  id="c-cover"
                  required
                  value={form.coverImage}
                  onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
                  placeholder="/collections/example.jpg"
                  className="mt-1 rounded-none"
                />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-gold-deep hover:underline">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => void handleCoverUpload(e)}
                  />
                  {uploading ? "Uploading…" : "+ Upload an image"}
                </label>
              </div>
              <div>
                <Label htmlFor="c-order">Display order</Label>
                <Input
                  id="c-order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  className="mt-1 rounded-none"
                />
              </div>
              <div>
                <Label>Products in this collection</Label>
                <div className="mt-1.5 max-h-40 space-y-1.5 overflow-y-auto border border-border p-3">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.productIds.includes(p.id)}
                        onCheckedChange={() => toggleProduct(p.id)}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                  {products.length === 0 && (
                    <p className="text-xs text-muted-foreground">No products yet.</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.featured}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, featured: c === true }))}
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.published}
                    onCheckedChange={(c) => setForm((f) => ({ ...f, published: c === true }))}
                  />
                  <span>Published</span>
                </label>
              </div>
              <Button type="submit" variant="luxe" className="w-full" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Collection"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* =========================================================================
   5. COUPONS & OFFERS MANAGER TAB
   ========================================================================= */
function CouponsManagerTab() {
  const { coupons, saveCoupon, deleteCoupon } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("15");

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode.trim()) return;
    const coupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      type: "percent",
      value: Number(newDiscount),
      minOrder: 2000,
      maxDiscount: null,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: null,
      perUserLimit: 1,
      newCustomerOnly: false,
      restrictedCollections: [],
      active: true,
      timesUsed: 0,
    };
    try {
      await saveCoupon(coupon);
      toast.success(`Coupon ${coupon.code} created`);
      setCreateOpen(false);
      setNewCode("");
    } catch {
      toast.error("Couldn't create that coupon. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl">Promotional Coupons &amp; Offers</h2>
          <p className="text-xs text-muted-foreground">
            Manage active discount campaigns and customer promotional codes.
          </p>
        </div>
        <Button variant="luxe" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <div className="border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order Value</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium text-foreground">{c.code}</TableCell>
                <TableCell className="font-medium text-gold-deep">
                  {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatINR(c.minOrder ?? 0)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(c.expiresAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-none text-xs",
                      c.active ? "border-emerald/50 text-emerald" : "text-muted-foreground",
                    )}
                  >
                    {c.active ? "Active" : "Expired"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        await deleteCoupon(c.id);
                        toast.success(`Coupon ${c.code} deleted`);
                      } catch {
                        toast.error("Couldn't delete that coupon. Please try again.");
                      }
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {createOpen && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-none border border-border bg-background p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create Promo Coupon</DialogTitle>
              <DialogDescription>Create a new promotion for checkout.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <Input
                  id="coupon-code"
                  placeholder="e.g. REGAL20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="mt-1 font-mono uppercase rounded-none"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coupon-pct">Discount Percentage (%)</Label>
                <Input
                  id="coupon-pct"
                  type="number"
                  min="5"
                  max="50"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="mt-1 rounded-none"
                  required
                />
              </div>
              <Button type="submit" variant="luxe" className="w-full">
                Publish Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* =========================================================================
   6. CUSTOMERS MANAGER TAB
   ========================================================================= */
function CustomersManagerTab() {
  const { users, user: currentUser, updateUser } = useStore();
  const [search, setSearch] = useState("");

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  async function handleToggleRole(target: (typeof users)[number]) {
    const nextRole = target.role === "admin" ? "customer" : "admin";
    try {
      await updateUser(target.id, { role: nextRole });
      toast.success(
        `${target.firstName} ${target.lastName} is now ${nextRole === "admin" ? "an admin" : "a customer"}`,
      );
    } catch {
      toast.error("Couldn't update that customer. Please try again.");
    }
  }

  async function handleToggleStatus(target: (typeof users)[number]) {
    const nextStatus = target.status === "blocked" ? "active" : "blocked";
    try {
      await updateUser(target.id, { status: nextStatus });
      toast.success(
        `${target.firstName} ${target.lastName} ${nextStatus === "blocked" ? "blocked" : "unblocked"}`,
      );
    } catch {
      toast.error("Couldn't update that customer. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl">Customers</h2>
          <p className="text-xs text-muted-foreground">
            Manage customer accounts — promote to admin or block access.
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone"
          className="max-w-xs rounded-none"
        />
      </div>

      <div className="border border-border/80 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-foreground">
                    {u.firstName} {u.lastName}
                    {isSelf && (
                      <span className="ml-2 text-[10px] uppercase text-muted-foreground">
                        (You)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{u.email}</div>
                    <div>{u.phone}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={u.role === "admin" ? "info" : "muted"}
                      label={u.role === "admin" ? "Admin" : "Customer"}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={u.status === "blocked" ? "destructive" : "success"}
                      label={u.status === "blocked" ? "Blocked" : "Active"}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => void handleToggleRole(u)}
                        className="text-xs"
                      >
                        {u.role === "admin" ? "Make Customer" : "Make Admin"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => void handleToggleStatus(u)}
                        className={cn(
                          "text-xs",
                          u.status === "blocked" ? "text-emerald" : "text-destructive",
                        )}
                      >
                        {u.status === "blocked" ? "Unblock" : "Block"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* =========================================================================
   7. LOGISTICS & DELHIVERY MANAGER TAB
   ========================================================================= */
function ShippingManagerTab() {
  const { orders, updateOrder } = useStore();
  const shippedOrders = orders.filter((o) => Boolean(o.shipment));

  async function handleSimulateDispatch(orderId: string) {
    const awb = `DLV${Math.floor(100000000 + Math.random() * 900000000)}`;
    try {
      await updateOrder(orderId, {
        status: "shipped",
        shipment: {
          courier: "Delhivery",
          awb,
          shipmentId: `SHP-${Date.now().toString().slice(-6)}`,
          trackingUrl: null,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          attempts: 0,
          ndrReason: null,
          rto: false,
          events: [
            {
              status: "shipped",
              at: new Date().toISOString(),
              label: "Package picked up by Delhivery Courier",
              location: "Jaipur Hub",
            },
          ],
        },
      });
      toast.success(`Generated Delhivery AWB: ${awb}`);
    } catch {
      toast.error("Couldn't generate the AWB. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Delhivery Logistics &amp; Shipping</h2>
        <p className="text-xs text-muted-foreground">
          Simulate carrier manifests, AWB creation, and tracking events.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-border/80 bg-card p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Carrier Status
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-medium">Delhivery Surface Express</span>
            <Badge variant="outline" className="border-emerald/50 text-emerald rounded-none">
              Active
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Origin Hub: Jaipur Central Facility, Rajasthan (302001)
          </p>
        </div>
        <div className="border border-border/80 bg-card p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            Tracking Engine
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-medium">Webhook Real-time Sync</span>
            <Badge variant="outline" className="border-gold/50 text-gold-deep rounded-none">
              Integration Ready
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Auto-updates customer tracking timeline on scan
          </p>
        </div>
      </div>

      <div className="border border-border/80 bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-foreground">
            Manifest &amp; AWB Dispatch Queue
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>AWB Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shippedOrders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium text-foreground">{o.id}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell className="font-mono text-xs text-gold-deep">
                  {o.shipment.awb ?? "Not generated"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-none text-xs capitalize">
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {!o.shipment.awb ? (
                    <Button variant="luxe" size="sm" onClick={() => handleSimulateDispatch(o.id)}>
                      Generate AWB
                    </Button>
                  ) : (
                    <Button asChild variant="luxeOutline" size="sm">
                      <Link
                        to={`/track?id=${o.id}&email=${encodeURIComponent(o.email)}`}
                        target="_blank"
                      >
                        View Tracking
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* =========================================================================
   8. STORE SETTINGS TAB
   ========================================================================= */
function SettingsManagerTab() {
  const { settings, updateSettings } = useStore();
  const [shippingThreshold, setShippingThreshold] = useState(
    String(settings.freeShippingThreshold),
  );
  const [shippingFee, setShippingFee] = useState(String(settings.shippingFee));
  const [codMax, setCodMax] = useState(String(settings.codMaxOrderValue));

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({
      freeShippingThreshold: Number(shippingThreshold),
      shippingFee: Number(shippingFee),
      codMaxOrderValue: Number(codMax),
    });
    toast.success("Store settings updated successfully");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">Store Configuration</h2>
        <p className="text-xs text-slate-500">
          Adjust shipping rules, payment limits, and store policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="border border-border/80 bg-card p-6 space-y-5">
        <div>
          <Label htmlFor="free-shipping">Complimentary Shipping Threshold (INR)</Label>
          <Input
            id="free-shipping"
            type="number"
            value={shippingThreshold}
            onChange={(e) => setShippingThreshold(e.target.value)}
            className="mt-1 rounded-none"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Orders equal to or exceeding this amount receive complimentary shipping.
          </p>
        </div>

        <div>
          <Label htmlFor="standard-shipping">Standard Shipping Fee (INR)</Label>
          <Input
            id="standard-shipping"
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
            className="mt-1 rounded-none"
          />
        </div>

        <div>
          <Label htmlFor="cod-max">Cash on Delivery Maximum Limit (INR)</Label>
          <Input
            id="cod-max"
            type="number"
            value={codMax}
            onChange={(e) => setCodMax(e.target.value)}
            className="mt-1 rounded-none"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Orders above this threshold will require online prepay.
          </p>
        </div>

        <Button type="submit" variant="luxe" className="w-full">
          Save Store Configuration
        </Button>
      </form>
    </div>
  );
}
