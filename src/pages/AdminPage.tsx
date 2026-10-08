import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Check,
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
import { toast } from "@/lib/toast";

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
  | "content"
  | "settings";

const TAB_TITLES: Record<AdminTab, string> = {
  overview: "Admin Dashboard",
  orders: "Orders & Fulfilment",
  products: "Products",
  collections: "Collections",
  coupons: "Coupons & Offers",
  customers: "Customers",
  shipping: "Logistics & Delhivery",
  content: "Homepage Content",
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
    segment === "content" ||
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
          {activeTab === "content" && <ContentManagerTab />}
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
  const { orders, products, adminCoupons: coupons, settings, hasPermission } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
        <div className="border border-destructive/40 bg-card rounded-xl shadow-sm overflow-hidden">
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
          <div className="overflow-x-auto">
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
                  <TableRow
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="cursor-pointer hover:bg-rose-50/50 transition-colors"
                  >
                    <TableCell className="font-semibold text-slate-900">{o.id}</TableCell>
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
                    <TableCell className="font-semibold text-slate-900">
                      {formatINR(o.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="luxeOutline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(o);
                        }}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 bg-slate-50/30">
                <TableHead className="text-xs font-semibold text-slate-500">Order ID</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Items</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Total</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <TableCell className="font-semibold text-slate-900 text-xs">{o.id}</TableCell>
                  <TableCell className="text-xs font-medium text-slate-700">
                    {o.customerName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(o.createdAt)}
                  </TableCell>
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

      {/* Overview Order Details Modal */}
      {selectedOrder && (
        <Dialog
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <div>
                  <DialogTitle className="font-display font-bold text-xl text-slate-900">
                    Order {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Customer: {selectedOrder.customerName} ({selectedOrder.email}) · Placed on{" "}
                    {formatDateTime(selectedOrder.createdAt)}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="rounded-full text-xs capitalize">
                    {orderStatusLabels[selectedOrder.status] || selectedOrder.status}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs capitalize">
                    {selectedOrder.payment.status}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-5">
              {selectedOrder.address && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Shipping &amp; Recipient Details
                  </p>
                  <div className="mt-2 text-xs text-slate-700 leading-relaxed space-y-0.5">
                    <p className="font-semibold text-slate-900">
                      {selectedOrder.address.fullName} — {selectedOrder.address.phone}
                    </p>
                    <p>
                      {selectedOrder.address.line1}, {selectedOrder.address.locality}
                    </p>
                    <p>
                      {selectedOrder.address.city}, {selectedOrder.address.state} —{" "}
                      {selectedOrder.address.pincode}
                    </p>
                    <p className="text-slate-500">Contact Email: {selectedOrder.email}</p>
                  </div>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Order Items ({selectedOrder.lines.length})
                </p>
                <ul className="mt-3 divide-y divide-slate-100">
                  {selectedOrder.lines.map((line, idx) => (
                    <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-12 w-10 rounded-md object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{line.name}</p>
                          <p className="text-xs text-slate-500">
                            Size: {line.size} · Colour: {line.colour} · Qty: {line.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {formatINR(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
                  <span>Order Total</span>
                  <span className="text-amber-800 text-base">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Payment Information
                  </p>
                  <div className="mt-2 text-xs space-y-1">
                    <p>
                      <span className="text-slate-500">Method:</span>{" "}
                      <strong className="uppercase">{selectedOrder.payment.method}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">Status:</span>{" "}
                      <strong className="capitalize">{selectedOrder.payment.status}</strong>
                    </p>
                    {selectedOrder.payment.transactionId && (
                      <p className="font-mono text-[11px] text-slate-600 truncate">
                        Txn: {selectedOrder.payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Logistics / Delhivery
                  </p>
                  <div className="mt-2 text-xs space-y-1">
                    <p>
                      <span className="text-slate-500">Courier:</span>{" "}
                      <strong>{selectedOrder.shipment?.courier ?? "Delhivery Surface"}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">AWB:</span>{" "}
                      <strong>{selectedOrder.shipment?.awb ?? "Not generated"}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedOrder(null);
                    onNavigateTab("orders");
                  }}
                  className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  Manage in Orders Tab →
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
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
      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
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
                  onClick={() => setSelectedOrder(o)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
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
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <div>
                  <DialogTitle className="font-display font-bold text-xl text-slate-900">
                    Order {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Customer: {selectedOrder.customerName} ({selectedOrder.email}) · Placed on{" "}
                    {formatDateTime(selectedOrder.createdAt)}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="rounded-full text-xs capitalize">
                    {orderStatusLabels[selectedOrder.status] || selectedOrder.status}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs capitalize">
                    {selectedOrder.payment.status}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-5">
              {/* Customer Contact & Delivery Address */}
              {selectedOrder.address && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Shipping &amp; Recipient Details
                  </p>
                  <div className="mt-2 text-xs text-slate-700 leading-relaxed space-y-0.5">
                    <p className="font-semibold text-slate-900">
                      {selectedOrder.address.fullName} — {selectedOrder.address.phone}
                    </p>
                    <p>
                      {selectedOrder.address.line1}, {selectedOrder.address.locality}
                    </p>
                    <p>
                      {selectedOrder.address.city}, {selectedOrder.address.state} —{" "}
                      {selectedOrder.address.pincode}
                    </p>
                    <p className="text-slate-500">Contact Email: {selectedOrder.email}</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Order Items ({selectedOrder.lines.length})
                </p>
                <ul className="mt-3 divide-y divide-slate-100">
                  {selectedOrder.lines.map((line, idx) => (
                    <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-12 w-10 rounded-md object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-medium text-slate-900">{line.name}</p>
                          <p className="text-xs text-slate-500">
                            Size: {line.size} · Colour: {line.colour} · Qty: {line.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {formatINR(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
                  <span>Order Total</span>
                  <span className="text-amber-800 text-base">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Payment & Logistics Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Payment Information
                  </p>
                  <div className="mt-2 text-xs space-y-1">
                    <p>
                      <span className="text-slate-500">Method:</span>{" "}
                      <strong className="uppercase">{selectedOrder.payment.method}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">Status:</span>{" "}
                      <strong className="capitalize">{selectedOrder.payment.status}</strong>
                    </p>
                    {selectedOrder.payment.transactionId && (
                      <p className="font-mono text-[11px] text-slate-600 truncate">
                        Txn: {selectedOrder.payment.transactionId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Logistics / Delhivery
                  </p>
                  <div className="mt-2 text-xs space-y-1">
                    <p>
                      <span className="text-slate-500">Courier:</span>{" "}
                      <strong>{selectedOrder.shipment?.courier ?? "Delhivery Surface"}</strong>
                    </p>
                    <p>
                      <span className="text-slate-500">AWB:</span>{" "}
                      <strong>{selectedOrder.shipment?.awb ?? "Not generated"}</strong>
                    </p>
                    {selectedOrder.shipment?.awb && (
                      <Link
                        to={`/track?id=${selectedOrder.id}&email=${encodeURIComponent(selectedOrder.email)}`}
                        target="_blank"
                        className="inline-block mt-1 text-xs text-amber-700 font-semibold hover:underline"
                      >
                        Open Public Tracking Page →
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Updater */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
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
                        "border px-3 py-1.5 text-xs rounded-lg capitalize transition-colors cursor-pointer",
                        selectedOrder.status === st
                          ? "border-slate-900 bg-slate-900 text-white font-medium shadow-xs"
                          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700",
                      )}
                    >
                      {orderStatusLabels[st] || st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Request Management */}
              {selectedOrder.returnRequest && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                    Return Request Pending
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    Reason: {selectedOrder.returnRequest.reason}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
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
  categoryIds: string[];
  material: string;
  clothMaterial: string;
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
  categoryIds: [],
  material: "",
  clothMaterial: "",
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

function CategoryPillsSelector({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { categories, saveCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setAddError("Please enter a category name");
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const category = await saveCategory(trimmed);
      if (!selectedIds.includes(category.id)) {
        onChange([...selectedIds, category.id]);
      }
      toast.success(`Category "${category.name}" selected`);
      setShowAddModal(false);
      setNewCategoryName("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      setAddError(msg);
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-foreground">Categories</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowAddModal(true);
            setAddError(null);
            setNewCategoryName("");
          }}
          className="h-7 px-2 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add New Category
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded border border-border bg-muted/20">
        {categories.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">
            No categories yet. Click &quot;+ Add New Category&quot; to create one.
          </span>
        ) : (
          categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleToggle(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border shadow-xs cursor-pointer",
                  isSelected
                    ? "bg-amber-700 text-white border-amber-800"
                    : "bg-background text-foreground/80 border-border hover:border-foreground/30 hover:bg-muted/60",
                )}
              >
                {isSelected ? (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Plus className="h-3 w-3 opacity-40" />
                )}
                {cat.name}
              </button>
            );
          })
        )}
      </div>

      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-sm rounded-none border border-border bg-background p-5">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Add New Category</DialogTitle>
              <DialogDescription className="text-xs">
                Create a new category. If it already exists, it will be selected directly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategory} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="inline-cat-name" className="text-xs">
                  Category Name
                </Label>
                <Input
                  id="inline-cat-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Festive Wear"
                  className="mt-1 rounded-none text-sm"
                  autoFocus
                />
                {addError && <p className="mt-1 text-xs text-destructive">{addError}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="luxe" size="sm" disabled={adding}>
                  {adding ? "Saving..." : "Add & Select"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ProductsManagerTab() {
  const { products, categories, saveProduct, deleteProduct, settings } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImagesByColour, setEditImagesByColour] = useState<Record<string, string[]>>({});
  const [activeColourTab, setActiveColourTab] = useState<string>("default");
  const [editUploading, setEditUploading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<ProductFormValues>(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: "images") {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImageRequest(file, "products");
        urls.push(url);
      }
      setForm((f) => {
        const existing = f[field] ? f[field].trim() : "";
        const combined = existing ? `${existing}\n${urls.join("\n")}` : urls.join("\n");
        return { ...f, [field]: combined };
      });
      toast.success(
        files.length === 1 ? "Image uploaded" : `${files.length} images uploaded successfully`,
      );
    } catch {
      toast.error("Couldn't upload image(s). Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleEditImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setEditUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadImageRequest(file, "products");
        urls.push(url);
      }
      if (activeColourTab === "default") {
        setEditImages((prev) => [...prev, ...urls]);
      } else {
        setEditImagesByColour((prev) => ({
          ...prev,
          [activeColourTab]: [...(prev[activeColourTab] || []), ...urls],
        }));
      }
      toast.success(
        files.length === 1 ? "Image uploaded" : `${files.length} images uploaded successfully`,
      );
    } catch {
      toast.error("Couldn't upload image(s). Please try again.");
    } finally {
      setEditUploading(false);
    }
  }

  async function handleToggleAvailability(prod: Product) {
    const nextPublished = !prod.published;
    try {
      await saveProduct({ ...prod, published: nextPublished });
      if (inspectedProduct && inspectedProduct.id === prod.id) {
        setInspectedProduct((prev) => (prev ? { ...prev, published: nextPublished } : null));
      }
      toast.success(`${prod.name} ${nextPublished ? "published to store" : "unpublished"}`);
    } catch {
      toast.error("Couldn't update that product. Please try again.");
    }
  }

  async function handleToggleVariantAvailability(product: Product, variantId: string) {
    const target = product.variants.find((variant) => variant.id === variantId);
    if (!target) return;

    const nextAvailability: Product["variants"][number]["availability"] =
      target.availability === "available" ? "unavailable" : "available";
    const updatedVariants: Product["variants"] = product.variants.map((variant) =>
      variant.id === variantId ? { ...variant, availability: nextAvailability } : variant,
    );
    const updatedProduct: Product = { ...product, variants: updatedVariants };

    try {
      await saveProduct(updatedProduct);
      setEditingProduct(updatedProduct);
      if (inspectedProduct && inspectedProduct.id === product.id) {
        setInspectedProduct(updatedProduct);
      }
      toast.success(
        `${target.colour} / ${target.size} marked ${nextAvailability === "available" ? "available" : "unavailable"}`,
      );
    } catch {
      toast.error("Couldn't update that variant. Please try again.");
    }
  }

  function handleStartEdit(prod: Product) {
    setEditingProduct(prod);
    setEditImages(prod.images ? [...prod.images] : []);
    setEditImagesByColour(prod.imagesByColour ? { ...prod.imagesByColour } : {});
    setActiveColourTab("default");
    if (prod.categoryIds && prod.categoryIds.length > 0) {
      setEditCategoryIds(prod.categoryIds);
    } else if (prod.category) {
      const match = categories.find(
        (c) =>
          c.name.toLowerCase() === prod.category.toLowerCase() || c.slug === slugify(prod.category),
      );
      setEditCategoryIds(match ? [match.id] : []);
    } else {
      setEditCategoryIds([]);
    }
  }

  async function handleSaveEditProduct(
    prod: Product,
    newPrice: number,
    catIds: string[],
    imagesToSave: string[],
    imagesByColourToSave: Record<string, string[]>,
  ) {
    try {
      const primaryCat = categories.find((c) => catIds.includes(c.id));
      const primaryCatName = primaryCat ? primaryCat.name : catIds.length > 0 ? "" : prod.category;
      const updated: Product = {
        ...prod,
        price: newPrice,
        categoryIds: catIds,
        category: primaryCatName,
        images: imagesToSave.length > 0 ? imagesToSave : prod.images,
        imagesByColour: imagesByColourToSave,
      };
      await saveProduct(updated);
      if (inspectedProduct && inspectedProduct.id === prod.id) {
        setInspectedProduct(updated);
      }
      toast.success(`Updated ${prod.name}`);
      setEditingProduct(null);
    } catch {
      toast.error("Couldn't update that product. Please try again.");
    }
  }

  async function handleDelete(prod: Product) {
    if (!window.confirm(`Delete "${prod.name}"? This can't be undone.`)) return;
    try {
      await deleteProduct(prod.id);
      if (inspectedProduct && inspectedProduct.id === prod.id) {
        setInspectedProduct(null);
      }
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
      const primaryCat = categories.find((c) => form.categoryIds.includes(c.id));
      const primaryCatName = primaryCat ? primaryCat.name : form.category.trim();

      await saveProduct({
        id: `new-${Date.now()}`,
        slug: form.slug.trim() || slugify(form.name),
        name: form.name.trim(),
        material: form.material.trim() || undefined,
        clothMaterial: form.clothMaterial.trim() || undefined,
        price: Number(form.price) || 0,
        mrp: Number(form.mrp) || Number(form.price) || 0,
        currency: "INR",
        images: splitList(form.images.replace(/\n/g, ",")),
        category: primaryCatName,
        categoryIds: form.categoryIds,
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

      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">Product</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Category</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Price</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">MRP</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Variants</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow
                key={p.id}
                onClick={() => setInspectedProduct(p)}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-12 w-10 object-cover rounded-md border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                      <p className="text-[11px] text-slate-400">Slug: {p.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-xs text-slate-700">
                  {p.categoryIds && p.categoryIds.length > 0
                    ? categories
                        .filter((c) => p.categoryIds?.includes(c.id))
                        .map((c) => c.name)
                        .join(", ") ||
                      p.category ||
                      "—"
                    : p.category || "—"}
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-900">
                  {formatINR(p.price)}
                </TableCell>
                <TableCell className="text-xs text-slate-400 line-through">
                  {formatINR(p.mrp)}
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-medium">
                  {p.variants.length} SKU(s)
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleToggleAvailability(p);
                    }}
                    className={cn(
                      "border px-2 py-0.5 text-[11px] rounded uppercase font-semibold tracking-wider transition-colors cursor-pointer",
                      p.published
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                    )}
                  >
                    {p.published ? "Live" : "Draft"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedProduct(p);
                      }}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(p);
                      }}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(p);
                      }}
                      className="text-rose-600 hover:bg-rose-50 h-8 w-8"
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
              <div>
                <CategoryPillsSelector
                  selectedIds={form.categoryIds}
                  onChange={(ids) => setForm((f) => ({ ...f, categoryIds: ids }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="p-material">Material</Label>
                  <Input
                    id="p-material"
                    list="material-options"
                    value={form.material}
                    onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                    className="mt-1 rounded-none"
                  />
                  <datalist id="material-options">
                    {settings.catalogMaterials.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label htmlFor="p-cloth-material">Cloth Material</Label>
                  <Input
                    id="p-cloth-material"
                    list="material-options"
                    value={form.clothMaterial}
                    onChange={(e) => setForm((f) => ({ ...f, clothMaterial: e.target.value }))}
                    className="mt-1 rounded-none"
                  />
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
                <Label htmlFor="p-images">Product Images (URLs or Upload)</Label>
                <Textarea
                  id="p-images"
                  rows={2}
                  value={form.images}
                  onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                  placeholder="/products/example.jpg (one URL per line)"
                  className="mt-1 rounded-none text-xs font-mono"
                />
                <div className="mt-2 flex items-center justify-between">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => void handleImageUpload(e, "images")}
                    />
                    <Plus className="h-3.5 w-3.5" />
                    {uploading ? "Uploading images…" : "+ Upload images (supports multiple)"}
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {form.images.split("\n").filter((u) => u.trim()).length} image(s)
                  </span>
                </div>
                {form.images.trim() && (
                  <div className="mt-3 flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 max-h-36 overflow-y-auto">
                    {form.images
                      .split("\n")
                      .map((u) => u.trim())
                      .filter(Boolean)
                      .map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group w-16 h-20 rounded border border-slate-200 overflow-hidden bg-white shadow-xs shrink-0"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/products/p1.jpg";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = form.images
                                .split("\n")
                                .map((u) => u.trim())
                                .filter(Boolean);
                              list.splice(idx, 1);
                              setForm((f) => ({ ...f, images: list.join("\n") }));
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white text-center py-0.5">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
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
          <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-none border border-border bg-background p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit Product</DialogTitle>
              <DialogDescription>{editingProduct.name}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.target as HTMLFormElement;
                const price = Number(
                  (formEl.elements.namedItem("price") as HTMLInputElement).value,
                );
                if (price > 0)
                  void handleSaveEditProduct(
                    editingProduct,
                    price,
                    editCategoryIds,
                    editImages,
                    editImagesByColour,
                  );
              }}
              className="mt-4 space-y-5"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>
                    Product Imagery{" "}
                    <span className="text-muted-foreground font-normal">
                      {activeColourTab === "default"
                        ? `(Default: ${editImages.length})`
                        : `(${activeColourTab}: ${editImagesByColour[activeColourTab]?.length || 0})`}
                    </span>
                  </Label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={editUploading}
                      onChange={(e) => void handleEditImagesUpload(e)}
                    />
                    <Plus className="h-3.5 w-3.5" />
                    {editUploading
                      ? "Uploading…"
                      : activeColourTab === "default"
                        ? "+ Upload default"
                        : `+ Upload for ${activeColourTab}`}
                  </label>
                </div>

                {editingProduct.colours && editingProduct.colours.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 text-xs border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveColourTab("default")}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer",
                        activeColourTab === "default"
                          ? "bg-slate-900 text-white font-medium shadow-xs"
                          : "text-slate-600 hover:bg-slate-100",
                      )}
                    >
                      Default ({editImages.length})
                    </button>
                    {editingProduct.colours.map((col) => {
                      const count = editImagesByColour[col]?.length || 0;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setActiveColourTab(col)}
                          className={cn(
                            "px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                            activeColourTab === col
                              ? "bg-[#c6903c] text-white font-medium shadow-xs"
                              : "text-slate-600 hover:bg-slate-100",
                          )}
                        >
                          <span>{col}</span>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full",
                              activeColourTab === col
                                ? "bg-white/25 text-white"
                                : "bg-slate-200 text-slate-700",
                            )}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {(() => {
                  const displayList =
                    activeColourTab === "default"
                      ? editImages
                      : editImagesByColour[activeColourTab] || [];
                  return displayList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                      {displayList.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group w-16 h-20 rounded border border-slate-200 overflow-hidden bg-white shadow-xs shrink-0"
                        >
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/products/p1.jpg";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (activeColourTab === "default") {
                                setEditImages((prev) => prev.filter((_, i) => i !== idx));
                              } else {
                                setEditImagesByColour((prev) => ({
                                  ...prev,
                                  [activeColourTab]: (prev[activeColourTab] || []).filter(
                                    (_, i) => i !== idx,
                                  ),
                                }));
                              }
                            }}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[8px] text-white text-center py-0.5">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 p-3 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center">
                      {activeColourTab === "default"
                        ? 'No default images uploaded. Click "+ Upload default" to add.'
                        : `No specific images uploaded for ${activeColourTab}. Storefront will fall back to default images.`}
                    </p>
                  );
                })()}
              </div>

              <div>
                <CategoryPillsSelector
                  selectedIds={editCategoryIds}
                  onChange={setEditCategoryIds}
                />
              </div>

              <div>
                <Label>Variant availability</Label>
                <div className="mt-2 space-y-2">
                  {editingProduct.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-3 rounded border border-border bg-muted/30 p-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {variant.colour} / {variant.size}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          {variant.availability}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={variant.availability === "available" ? "luxe" : "outline"}
                        size="sm"
                        onClick={() =>
                          void handleToggleVariantAvailability(editingProduct, variant.id)
                        }
                      >
                        {variant.availability === "available" ? "Available" : "Unavailable"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="luxe" className="w-full">
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Product Inspection & Details Modal */}
      {inspectedProduct && (
        <Dialog
          open={Boolean(inspectedProduct)}
          onOpenChange={(open) => !open && setInspectedProduct(null)}
        >
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="font-display font-bold text-xl text-slate-900">
                    {inspectedProduct.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Slug: <span className="font-mono text-slate-700">{inspectedProduct.slug}</span>
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {inspectedProduct.badge && (
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs uppercase bg-amber-50 text-amber-800 border-amber-200"
                    >
                      {inspectedProduct.badge}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-xs font-semibold capitalize",
                      inspectedProduct.published
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                    )}
                  >
                    {inspectedProduct.published ? "Live on Store" : "Draft"}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-6">
              {/* Product Images Preview */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Product Imagery ({inspectedProduct.images.length})
                </p>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {inspectedProduct.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0 w-24 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={img}
                        alt={`${inspectedProduct.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Category Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Selling Price</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {formatINR(inspectedProduct.price)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">MRP</p>
                  <p className="text-sm font-medium text-slate-400 line-through mt-0.5">
                    {formatINR(inspectedProduct.mrp)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Category</p>
                  <p className="text-xs font-semibold text-slate-800 capitalize mt-1">
                    {inspectedProduct.categoryIds && inspectedProduct.categoryIds.length > 0
                      ? categories
                          .filter((c) => inspectedProduct.categoryIds?.includes(c.id))
                          .map((c) => c.name)
                          .join(", ") ||
                        inspectedProduct.category ||
                        "—"
                      : inspectedProduct.category || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Total SKUs</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {inspectedProduct.variants.length} Variants
                  </p>
                </div>
              </div>

              {/* Materials & Descriptions */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Specifications &amp; Story
                </p>
                {(inspectedProduct.material || inspectedProduct.clothMaterial) && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {inspectedProduct.material && (
                      <p>
                        <span className="text-slate-500">Material:</span>{" "}
                        <strong className="text-slate-800">{inspectedProduct.material}</strong>
                      </p>
                    )}
                    {inspectedProduct.clothMaterial && (
                      <p>
                        <span className="text-slate-500">Fabric:</span>{" "}
                        <strong className="text-slate-800">{inspectedProduct.clothMaterial}</strong>
                      </p>
                    )}
                  </div>
                )}
                {inspectedProduct.shortDescription && (
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{inspectedProduct.shortDescription}"
                  </p>
                )}
                {inspectedProduct.tags && inspectedProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inspectedProduct.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Variant Stock Availability */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Variant Inventory ({inspectedProduct.variants.length})
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {inspectedProduct.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {variant.colour} / {variant.size}
                        </p>
                        <p className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
                          ID: {variant.id}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={variant.availability === "available" ? "luxe" : "outline"}
                        size="sm"
                        className="text-xs h-7"
                        onClick={() =>
                          void handleToggleVariantAvailability(inspectedProduct, variant.id)
                        }
                      >
                        {variant.availability === "available" ? "In Stock" : "Unavailable"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                <Button
                  variant="luxe"
                  size="sm"
                  onClick={() => {
                    handleStartEdit(inspectedProduct);
                  }}
                  className="flex-1"
                >
                  Edit Price &amp; Category
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleToggleAvailability(inspectedProduct)}
                  className="flex-1 border-slate-200"
                >
                  {inspectedProduct.published ? "Unpublish to Draft" : "Publish Live"}
                </Button>
                <Button asChild variant="outline" size="sm" className="border-slate-200">
                  <Link to={`/products/${inspectedProduct.slug}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View in Store
                  </Link>
                </Button>
              </div>
            </div>
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
  const [inspectedCollection, setInspectedCollection] = useState<Collection | null>(null);
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
      const url = await uploadImageRequest(file, "collections");
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
      if (inspectedCollection && inspectedCollection.id === c.id) {
        setInspectedCollection(null);
      }
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
      const updatedCollection: Collection = {
        id: editing?.id ?? `new-${Date.now()}`,
        slug: form.slug.trim() || slugify(form.name),
        name: form.name.trim(),
        description: form.description.trim(),
        coverImage: form.coverImage.trim(),
        bannerImage: editing?.bannerImage ?? form.coverImage.trim(),
        productIds: form.productIds,
        featured: form.featured,
        published: form.published,
        order: Number(form.order) || 0,
      };
      await saveCollection(updatedCollection);
      if (inspectedCollection && inspectedCollection.id === updatedCollection.id) {
        setInspectedCollection(updatedCollection);
      }
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

      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">Collection</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Products</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Featured</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((c) => (
              <TableRow
                key={c.id}
                onClick={() => setInspectedCollection(c)}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    {c.coverImage && (
                      <img
                        src={c.coverImage}
                        alt={c.name}
                        className="h-12 w-16 object-cover rounded-md border border-slate-200"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{c.name}</p>
                      <p className="text-[11px] text-slate-400">Slug: {c.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-700 font-medium">
                  {c.productIds.length} items
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {c.featured ? (
                    <Badge
                      variant="outline"
                      className="rounded-full text-[10px] bg-amber-50 text-amber-800 border-amber-200"
                    >
                      Featured
                    </Badge>
                  ) : (
                    "No"
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={c.published ? "success" : "muted"}
                    label={c.published ? "Published" : "Draft"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedCollection(c);
                      }}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(c);
                      }}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(c);
                      }}
                      className="text-rose-600 hover:bg-rose-50 h-8 w-8"
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

      {/* Collection Inspection & Details Modal */}
      {inspectedCollection && (
        <Dialog
          open={Boolean(inspectedCollection)}
          onOpenChange={(open) => !open && setInspectedCollection(null)}
        >
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="font-display font-bold text-xl text-slate-900">
                    {inspectedCollection.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Slug:{" "}
                    <span className="font-mono text-slate-700">{inspectedCollection.slug}</span>
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  {inspectedCollection.featured && (
                    <Badge
                      variant="outline"
                      className="rounded-full text-xs uppercase bg-amber-50 text-amber-800 border-amber-200"
                    >
                      Featured
                    </Badge>
                  )}
                  <StatusBadge
                    status={inspectedCollection.published ? "success" : "muted"}
                    label={inspectedCollection.published ? "Published" : "Draft"}
                  />
                </div>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-6">
              {/* Media Preview */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Collection Cover Preview
                </p>
                {inspectedCollection.coverImage ? (
                  <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
                    <img
                      src={inspectedCollection.coverImage}
                      alt={inspectedCollection.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <p className="text-white font-display text-lg font-bold">
                          {inspectedCollection.name}
                        </p>
                        <p className="text-white/80 text-xs">
                          {inspectedCollection.productIds.length} Curated Pieces
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                    No cover image uploaded
                  </div>
                )}
              </div>

              {/* Description & Order */}
              {inspectedCollection.description && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Editorial Description
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {inspectedCollection.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Display Sort Order: {inspectedCollection.order}
                  </p>
                </div>
              )}

              {/* Assigned Products */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Assigned Products ({inspectedCollection.productIds.length})
                </p>
                {inspectedCollection.productIds.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No products assigned to this collection yet.
                  </p>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {products
                      .filter((p) => inspectedCollection.productIds.includes(p.id))
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-10 w-8 object-cover rounded border border-slate-200"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {formatINR(p.price)} · {p.variants.length} SKU(s)
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/products/${p.slug}`}
                            target="_blank"
                            className="text-xs text-amber-700 font-medium hover:underline flex items-center gap-1"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                <Button
                  variant="luxe"
                  size="sm"
                  onClick={() => {
                    openEdit(inspectedCollection);
                  }}
                  className="flex-1"
                >
                  Edit Collection Details
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1 border-slate-200">
                  <Link to={`/collections/${inspectedCollection.slug}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View on Storefront
                  </Link>
                </Button>
              </div>
            </div>
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
  const { adminCoupons, saveCoupon, deleteCoupon } = useStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [inspectedCoupon, setInspectedCoupon] = useState<Coupon | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percent" | "fixed">("percent");
  const [newDiscount, setNewDiscount] = useState("15");
  const [newMinOrder, setNewMinOrder] = useState("2000");
  const [newIsPublic, setNewIsPublic] = useState(true);

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode.trim()) return;
    const coupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: Number(newDiscount),
      minOrder: Number(newMinOrder) || 0,
      maxDiscount: null,
      startsAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: null,
      perUserLimit: 1,
      newCustomerOnly: false,
      restrictedCollections: [],
      isPublic: newIsPublic,
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

  async function handleToggleCouponActive(coupon: Coupon) {
    const nextActive = !coupon.active;
    try {
      const updated: Coupon = { ...coupon, active: nextActive };
      await saveCoupon(updated);
      if (inspectedCoupon && inspectedCoupon.id === coupon.id) {
        setInspectedCoupon(updated);
      }
      toast.success(`Coupon ${coupon.code} marked ${nextActive ? "Active" : "Inactive"}`);
    } catch {
      toast.error("Couldn't update that coupon. Please try again.");
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

      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">Code</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Discount</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">
                Min Order Value
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Expires</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Visibility</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminCoupons.map((c) => (
              <TableRow
                key={c.id}
                onClick={() => setInspectedCoupon(c)}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <TableCell className="font-mono font-semibold text-slate-900 text-xs">
                  {c.code}
                </TableCell>
                <TableCell className="font-bold text-amber-800 text-xs">
                  {c.type === "percent" ? `${c.value}% OFF` : `${formatINR(c.value)} OFF`}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {formatINR(c.minOrder ?? 0)}
                </TableCell>
                <TableCell className="text-xs text-slate-500">{formatDate(c.expiresAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-full text-[11px] font-medium border-slate-200 bg-slate-50 text-slate-700"
                  >
                    {c.isPublic ? "Public" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-[11px] font-semibold",
                      c.active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-500",
                    )}
                  >
                    {c.active ? "Active" : "Expired"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedCoupon(c);
                      }}
                      className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm(`Delete coupon "${c.code}"? This can't be undone.`))
                          return;
                        try {
                          await deleteCoupon(c.id);
                          if (inspectedCoupon && inspectedCoupon.id === c.id) {
                            setInspectedCoupon(null);
                          }
                          toast.success(`Coupon ${c.code} deleted`);
                        } catch {
                          toast.error("Couldn't delete that coupon. Please try again.");
                        }
                      }}
                      className="text-rose-600 hover:bg-rose-50 h-8 w-8"
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

      {/* Create Coupon Modal */}
      {createOpen && (
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-display font-bold text-xl text-slate-900">
                Create Promo Coupon
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Create a promotional voucher code for checkout.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <Input
                  id="coupon-code"
                  placeholder="e.g. LUXE20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="mt-1 font-mono uppercase rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="coupon-type">Discount Type</Label>
                  <Select
                    value={newType}
                    onValueChange={(val: "percent" | "fixed") => setNewType(val)}
                  >
                    <SelectTrigger id="coupon-type" className="mt-1 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Flat (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="coupon-pct">
                    {newType === "percent" ? "Percentage (%)" : "Flat Amount (₹)"}
                  </Label>
                  <Input
                    id="coupon-pct"
                    type="number"
                    min="1"
                    max={newType === "percent" ? "90" : "50000"}
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="coupon-min">Minimum Order Value (INR)</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  min="0"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(e.target.value)}
                  className="mt-1 rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <Checkbox
                  checked={newIsPublic}
                  onCheckedChange={(c) => setNewIsPublic(c === true)}
                />
                <span>List publicly (shown to customers in Account &gt; Coupons)</span>
              </label>

              <Button type="submit" variant="luxe" className="w-full">
                Publish Coupon
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Coupon Inspection & Details Modal */}
      {inspectedCoupon && (
        <Dialog
          open={Boolean(inspectedCoupon)}
          onOpenChange={(open) => !open && setInspectedCoupon(null)}
        >
          <DialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-6">
                <div>
                  <DialogTitle className="font-mono text-2xl font-bold text-slate-900 tracking-wider">
                    {inspectedCoupon.code}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-1">
                    Promotional Campaign Voucher
                  </DialogDescription>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full text-xs font-semibold capitalize",
                    inspectedCoupon.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                  )}
                >
                  {inspectedCoupon.active ? "Active" : "Expired"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-800">
                    Discount Rate
                  </p>
                  <p className="font-display text-2xl font-bold text-amber-900 mt-0.5">
                    {inspectedCoupon.type === "percent"
                      ? `${inspectedCoupon.value}% OFF`
                      : `${formatINR(inspectedCoupon.value)} OFF`}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-500">Min Order</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {formatINR(inspectedCoupon.minOrder ?? 0)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="text-slate-400 font-medium">Valid From</p>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {formatDate(inspectedCoupon.startsAt)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Expires On</p>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {formatDate(inspectedCoupon.expiresAt)}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-slate-400 font-medium">Times Used</p>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {inspectedCoupon.timesUsed} times
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-slate-400 font-medium">Visibility</p>
                  <p className="text-slate-700 font-semibold mt-0.5">
                    {inspectedCoupon.isPublic ? "Public Showcase" : "Targeted / Private"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleToggleCouponActive(inspectedCoupon)}
                  className="flex-1 border-slate-200"
                >
                  {inspectedCoupon.active ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (!window.confirm(`Delete coupon "${inspectedCoupon.code}"?`)) return;
                    await deleteCoupon(inspectedCoupon.id);
                    setInspectedCoupon(null);
                    toast.success("Coupon deleted");
                  }}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </div>
            </div>
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
  const { users, user: currentUser, updateUser, orders } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof users)[number] | null>(null);

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
      if (selectedCustomer && selectedCustomer.id === target.id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, role: nextRole } : null));
      }
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
      if (selectedCustomer && selectedCustomer.id === target.id) {
        setSelectedCustomer((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      toast.success(
        `${target.firstName} ${target.lastName} ${nextStatus === "blocked" ? "blocked" : "unblocked"}`,
      );
    } catch {
      toast.error("Couldn't update that customer. Please try again.");
    }
  }

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.email.toLowerCase() === selectedCustomer.email.toLowerCase() ||
          o.customerName.toLowerCase() ===
            `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.toLowerCase(),
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl">Customers</h2>
          <p className="text-xs text-muted-foreground">
            Manage customer accounts — inspect details, promote roles, or restrict access.
          </p>
        </div>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone"
          className="max-w-xs rounded-lg"
        />
      </div>

      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Contact</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Role</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Joined</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <TableRow
                  key={u.id}
                  onClick={() => setSelectedCustomer(u)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <TableCell className="font-medium text-slate-900 text-xs">
                    {u.firstName} {u.lastName}
                    {isSelf && (
                      <span className="ml-2 text-[10px] uppercase font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        (You)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    <div>{u.email}</div>
                    <div className="text-[11px] text-slate-400">{u.phone}</div>
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
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(u);
                        }}
                        className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleToggleRole(u);
                        }}
                        className="text-xs text-slate-700"
                      >
                        {u.role === "admin" ? "Make Customer" : "Make Admin"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isSelf}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleToggleStatus(u);
                        }}
                        className={cn(
                          "text-xs",
                          u.status === "blocked"
                            ? "text-emerald-700 hover:bg-emerald-50"
                            : "text-rose-600 hover:bg-rose-50",
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

      {/* Customer Profile & Inspection Modal */}
      {selectedCustomer && (
        <Dialog
          open={Boolean(selectedCustomer)}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
        >
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                    {selectedCustomer.firstName[0]}
                    {selectedCustomer.lastName[0]}
                  </div>
                  <div>
                    <DialogTitle className="font-display font-bold text-xl text-slate-900">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                      {selectedCustomer.email} · {selectedCustomer.phone}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={selectedCustomer.role === "admin" ? "info" : "muted"}
                    label={selectedCustomer.role === "admin" ? "Admin" : "Customer"}
                  />
                  <StatusBadge
                    status={selectedCustomer.status === "blocked" ? "destructive" : "success"}
                    label={selectedCustomer.status === "blocked" ? "Blocked" : "Active"}
                  />
                </div>
              </div>
            </DialogHeader>

            <div className="mt-5 space-y-6">
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Email Verified</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {selectedCustomer.isEmailVerified ? (
                      <span className="text-emerald-700">✓ Verified</span>
                    ) : (
                      <span className="text-amber-700">Pending</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Member Since</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Saved Addresses</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {selectedCustomer.addresses?.length ?? 0} Saved
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Total Orders</p>
                  <p className="text-xs font-bold text-amber-800 mt-1">
                    {customerOrders.length} Placed
                  </p>
                </div>
              </div>

              {/* Delivery Addresses */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Saved Delivery Addresses ({selectedCustomer.addresses?.length ?? 0})
                </p>
                {!selectedCustomer.addresses || selectedCustomer.addresses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No delivery addresses on file.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCustomer.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs text-slate-700 leading-relaxed"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-900">
                            {addr.fullName} ({addr.label})
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              Default Address
                            </span>
                          )}
                        </div>
                        <p>
                          {addr.line1}, {addr.locality}
                        </p>
                        <p>
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Customer Order History ({customerOrders.length})
                </p>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No order records found for this account.
                  </p>
                ) : (
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                    {customerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{ord.id}</p>
                          <p className="text-[11px] text-slate-400">
                            {formatDateTime(ord.createdAt)} · {ord.lines.length} piece(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatINR(ord.total)}</p>
                          <span className="text-[10px] uppercase font-semibold text-slate-600">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Account Controls */}
              {selectedCustomer.id !== currentUser?.id && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToggleRole(selectedCustomer)}
                    className="flex-1 border-slate-200"
                  >
                    {selectedCustomer.role === "admin" ? "Demote to Customer" : "Promote to Admin"}
                  </Button>
                  <Button
                    variant={selectedCustomer.status === "blocked" ? "luxe" : "outline"}
                    size="sm"
                    onClick={() => void handleToggleStatus(selectedCustomer)}
                    className={cn(
                      "flex-1",
                      selectedCustomer.status !== "blocked" &&
                        "text-rose-600 border-rose-200 hover:bg-rose-50",
                    )}
                  >
                    {selectedCustomer.status === "blocked"
                      ? "Unblock Account Access"
                      : "Block Customer Account"}
                  </Button>
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
   7. LOGISTICS & DELHIVERY MANAGER TAB
   ========================================================================= */
function ShippingManagerTab() {
  const { orders, updateOrder, settings } = useStore();
  const [selectedShipmentOrder, setSelectedShipmentOrder] = useState<Order | null>(null);
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
      if (selectedShipmentOrder && selectedShipmentOrder.id === orderId) {
        setSelectedShipmentOrder((prev) =>
          prev
            ? {
                ...prev,
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
              }
            : null,
        );
      }
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
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Carrier Status
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-semibold text-slate-900">
              Delhivery Surface Express
            </span>
            {settings.delhiveryConnected ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full text-xs"
              >
                Active
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-800 rounded-full text-xs"
              >
                Simulated / Sandbox
              </Badge>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            {settings.delhiveryConnected
              ? "Origin Hub: Jaipur Central Facility, Rajasthan (302001)"
              : "AWB generation operates in simulated live courier mode until a production Delhivery account is toggled in Settings."}
          </p>
        </div>
        <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Tracking Engine
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-base font-semibold text-slate-900">Webhook Real-time Sync</span>
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full text-xs"
            >
              Live &amp; Synchronized
            </Badge>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Auto-updates customer tracking timeline on package scans and delivery checkpoints.
          </p>
        </div>
      </div>

      <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Manifest &amp; AWB Dispatch Queue ({shippedOrders.length})
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-500">Order ID</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Customer</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">AWB Code</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shippedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-xs text-slate-500">
                  No shipments in queue. Process orders to manifest dispatch items.
                </TableCell>
              </TableRow>
            ) : (
              shippedOrders.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => setSelectedShipmentOrder(o)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <TableCell className="font-semibold text-slate-900 text-xs">{o.id}</TableCell>
                  <TableCell className="text-xs text-slate-700">{o.customerName}</TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-amber-800">
                    {o.shipment?.awb ?? "Not generated"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-[11px] capitalize">
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShipmentOrder(o);
                        }}
                        className="text-xs font-medium border-slate-200 hover:bg-slate-100"
                      >
                        Inspect
                      </Button>
                      {!o.shipment?.awb ? (
                        <Button
                          variant="luxe"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleSimulateDispatch(o.id);
                          }}
                        >
                          Generate AWB
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm" className="border-slate-200">
                          <Link
                            to={`/track?id=${o.id}&email=${encodeURIComponent(o.email)}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Track
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Shipment & Tracking Details Modal */}
      {selectedShipmentOrder && (
        <Dialog
          open={Boolean(selectedShipmentOrder)}
          onOpenChange={(open) => !open && setSelectedShipmentOrder(null)}
        >
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="font-display font-bold text-xl text-slate-900">
                    Shipment for {selectedShipmentOrder.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Recipient: {selectedShipmentOrder.customerName} ({selectedShipmentOrder.email})
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="rounded-full text-xs capitalize">
                  {selectedShipmentOrder.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="mt-5 space-y-6">
              {/* Courier & AWB Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Logistics Carrier</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedShipmentOrder.shipment?.courier ?? "Delhivery Surface Express"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Waybill (AWB)</p>
                  <p className="font-mono text-sm font-bold text-amber-800 mt-0.5">
                    {selectedShipmentOrder.shipment?.awb ?? "Pending Generation"}
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedShipmentOrder.address && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Delivery Destination
                  </p>
                  <div className="text-xs text-slate-700 leading-relaxed space-y-0.5">
                    <p className="font-semibold text-slate-900">
                      {selectedShipmentOrder.address.fullName} —{" "}
                      {selectedShipmentOrder.address.phone}
                    </p>
                    <p>
                      {selectedShipmentOrder.address.line1},{" "}
                      {selectedShipmentOrder.address.locality}
                    </p>
                    <p>
                      {selectedShipmentOrder.address.city}, {selectedShipmentOrder.address.state} —{" "}
                      {selectedShipmentOrder.address.pincode}
                    </p>
                  </div>
                </div>
              )}

              {/* Package Line Items */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Package Contents ({selectedShipmentOrder.lines.length} items)
                </p>
                <div className="space-y-2">
                  {selectedShipmentOrder.lines.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-10 w-8 object-cover rounded border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-slate-500">
                            {item.size} · {item.colour}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-slate-700">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Event Log */}
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Tracking Event Log
                </p>
                {selectedShipmentOrder.shipment?.events &&
                selectedShipmentOrder.shipment.events.length > 0 ? (
                  <div className="space-y-3">
                    {selectedShipmentOrder.shipment.events.map((evt, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">{evt.label}</p>
                          <p className="text-slate-500">
                            {evt.location} · {formatDateTime(evt.at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-2">No milestone scans logged yet.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                {!selectedShipmentOrder.shipment?.awb ? (
                  <Button
                    variant="luxe"
                    size="sm"
                    onClick={() => void handleSimulateDispatch(selectedShipmentOrder.id)}
                    className="flex-1"
                  >
                    Generate Delhivery AWB Now
                  </Button>
                ) : (
                  <Button asChild variant="luxe" size="sm" className="flex-1">
                    <Link
                      to={`/track?id=${selectedShipmentOrder.id}&email=${encodeURIComponent(selectedShipmentOrder.email)}`}
                      target="_blank"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Open Public Tracking Portal
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* =========================================================================
   8. HOMEPAGE CONTENT TAB
   ========================================================================= */
function ContentManagerTab() {
  const { content, updateContent, products, collections } = useStore();
  const [form, setForm] = useState(content);
  const [uploadingSection, setUploadingSection] = useState<string | null>(null);

  // Content loads asynchronously (GET /api/content) after this tab's initial
  // render — resync the form once the real values arrive, same as Settings.
  useEffect(() => {
    setForm(content);
  }, [content]);

  async function handleBannerUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    sectionKey: "hero" | "editorial" | "promo",
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingSection(sectionKey);
    try {
      const url = await uploadImageRequest(file, "content");
      setForm((f) => ({
        ...f,
        [sectionKey]: {
          ...f[sectionKey],
          image: url,
        },
      }));
      toast.success(`${sectionKey.toUpperCase()} banner image uploaded`);
    } catch {
      toast.error("Couldn't upload image. Please try again.");
    } finally {
      setUploadingSection(null);
    }
  }

  function toggleSection(key: string) {
    setForm((f) => ({
      ...f,
      sections: f.sections.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)),
    }));
  }

  function toggleFeaturedProduct(slug: string) {
    setForm((f) => ({
      ...f,
      featuredProductIds: f.featuredProductIds.includes(slug)
        ? f.featuredProductIds.filter((s) => s !== slug)
        : [...f.featuredProductIds, slug],
    }));
  }

  function toggleFeaturedCollection(slug: string) {
    setForm((f) => ({
      ...f,
      featuredCollectionIds: f.featuredCollectionIds.includes(slug)
        ? f.featuredCollectionIds.filter((s) => s !== slug)
        : [...f.featuredCollectionIds, slug],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateContent(form);
      toast.success("Homepage content & banners updated successfully");
    } catch {
      toast.error("Couldn't update homepage content. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Homepage Content &amp; Banners
        </h2>
        <p className="text-xs text-slate-500">
          Upload banner images, edit announcement copy, hero, editorial sections, and manage
          featured products.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="border border-border/80 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Announcement Bar</h3>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.announcement.enabled}
              onCheckedChange={(c) =>
                setForm((f) => ({ ...f, announcement: { ...f.announcement, enabled: c === true } }))
              }
            />
            <span>Show announcement bar</span>
          </label>
          <div>
            <Label htmlFor="announcement-text">Announcement text</Label>
            <Input
              id="announcement-text"
              value={form.announcement.text}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  announcement: { ...f.announcement, text: e.target.value },
                }))
              }
              className="mt-1 rounded-none"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="border border-border/80 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Hero Section &amp; Banner</h3>
          <div>
            <Label>Hero Background Banner Image</Label>
            {form.hero.image ? (
              <div className="relative mt-2 aspect-[21/9] w-full overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={form.hero.image}
                  alt="Hero banner preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, hero: { ...f.hero, image: "" } }))}
                  className="absolute right-2 top-2 rounded-md bg-black/70 p-1.5 text-white hover:bg-black"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">Default hero image is active</div>
            )}
            <div className="mt-2 flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBannerUpload(e, "hero")}
                  disabled={uploadingSection === "hero"}
                />
                <span className="inline-flex h-9 items-center rounded-none border border-input bg-background px-4 text-xs font-medium hover:bg-accent">
                  {uploadingSection === "hero" ? "Uploading…" : "Upload Hero Banner Image"}
                </span>
              </label>
              <Input
                placeholder="Or paste image URL"
                value={form.hero.image ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hero: { ...f.hero, image: e.target.value } }))
                }
                className="rounded-none text-xs"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="hero-eyebrow">Eyebrow</Label>
            <Input
              id="hero-eyebrow"
              value={form.hero.eyebrow}
              onChange={(e) =>
                setForm((f) => ({ ...f, hero: { ...f.hero, eyebrow: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="hero-heading">Heading</Label>
            <Input
              id="hero-heading"
              value={form.hero.heading}
              onChange={(e) =>
                setForm((f) => ({ ...f, hero: { ...f.hero, heading: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="hero-subheading">Subheading</Label>
            <Textarea
              id="hero-subheading"
              value={form.hero.subheading}
              onChange={(e) =>
                setForm((f) => ({ ...f, hero: { ...f.hero, subheading: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hero-primary-cta">Primary button label</Label>
              <Input
                id="hero-primary-cta"
                value={form.hero.primaryCta}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hero: { ...f.hero, primaryCta: e.target.value } }))
                }
                className="mt-1 rounded-none"
              />
            </div>
            <div>
              <Label htmlFor="hero-secondary-cta">Secondary button label</Label>
              <Input
                id="hero-secondary-cta"
                value={form.hero.secondaryCta}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hero: { ...f.hero, secondaryCta: e.target.value } }))
                }
                className="mt-1 rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Editorial Banner */}
        <div className="border border-border/80 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Editorial Banner</h3>
          <div>
            <Label>Editorial Background Banner Image</Label>
            {form.editorial.image ? (
              <div className="relative mt-2 aspect-[21/9] w-full overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={form.editorial.image}
                  alt="Editorial banner preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, editorial: { ...f.editorial, image: "" } }))
                  }
                  className="absolute right-2 top-2 rounded-md bg-black/70 p-1.5 text-white hover:bg-black"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">
                Default editorial portrait image is active
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleBannerUpload(e, "editorial")}
                  disabled={uploadingSection === "editorial"}
                />
                <span className="inline-flex h-9 items-center rounded-none border border-input bg-background px-4 text-xs font-medium hover:bg-accent">
                  {uploadingSection === "editorial" ? "Uploading…" : "Upload Editorial Banner"}
                </span>
              </label>
              <Input
                placeholder="Or paste image URL"
                value={form.editorial.image ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, editorial: { ...f.editorial, image: e.target.value } }))
                }
                className="rounded-none text-xs"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="editorial-heading">Heading</Label>
            <Input
              id="editorial-heading"
              value={form.editorial.heading}
              onChange={(e) =>
                setForm((f) => ({ ...f, editorial: { ...f.editorial, heading: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="editorial-caption">Caption</Label>
            <Textarea
              id="editorial-caption"
              value={form.editorial.caption}
              onChange={(e) =>
                setForm((f) => ({ ...f, editorial: { ...f.editorial, caption: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="editorial-cta">Button label</Label>
            <Input
              id="editorial-cta"
              value={form.editorial.cta}
              onChange={(e) =>
                setForm((f) => ({ ...f, editorial: { ...f.editorial, cta: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="border border-border/80 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Promotional Banner</h3>
          <div>
            <Label htmlFor="promo-heading">Heading</Label>
            <Input
              id="promo-heading"
              value={form.promo.heading}
              onChange={(e) =>
                setForm((f) => ({ ...f, promo: { ...f.promo, heading: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="promo-caption">Caption</Label>
            <Textarea
              id="promo-caption"
              value={form.promo.caption}
              onChange={(e) =>
                setForm((f) => ({ ...f, promo: { ...f.promo, caption: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="promo-cta">Button label</Label>
            <Input
              id="promo-cta"
              value={form.promo.cta}
              onChange={(e) =>
                setForm((f) => ({ ...f, promo: { ...f.promo, cta: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
        </div>

        <div className="border border-border/80 bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">Brand Story</h3>
          <div>
            <Label htmlFor="story-heading">Heading</Label>
            <Input
              id="story-heading"
              value={form.story.heading}
              onChange={(e) =>
                setForm((f) => ({ ...f, story: { ...f.story, heading: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="story-body">Body</Label>
            <Textarea
              id="story-body"
              value={form.story.body}
              onChange={(e) =>
                setForm((f) => ({ ...f, story: { ...f.story, body: e.target.value } }))
              }
              className="mt-1 rounded-none"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="story-cta">Button label</Label>
            <Input
              id="story-cta"
              value={form.story.cta}
              onChange={(e) =>
                setForm((f) => ({ ...f, story: { ...f.story, cta: e.target.value } }))
              }
              className="mt-1 rounded-none"
            />
          </div>
        </div>

        <div className="border border-border/80 bg-card p-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Section Visibility</h3>
          {form.sections.map((s) => (
            <label key={s.key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={s.visible} onCheckedChange={() => toggleSection(s.key)} />
              <span>{s.label}</span>
            </label>
          ))}
        </div>

        <div className="border border-border/80 bg-card p-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Featured Products</h3>
          <div className="max-h-48 space-y-1.5 overflow-y-auto border border-border p-3">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.featuredProductIds.includes(p.slug)}
                  onCheckedChange={() => toggleFeaturedProduct(p.slug)}
                />
                <span>{p.name}</span>
              </label>
            ))}
            {products.length === 0 && (
              <p className="text-xs text-muted-foreground">No products yet.</p>
            )}
          </div>
        </div>

        <div className="border border-border/80 bg-card p-6 space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Featured Collections</h3>
          <div className="max-h-48 space-y-1.5 overflow-y-auto border border-border p-3">
            {collections.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.featuredCollectionIds.includes(c.slug)}
                  onCheckedChange={() => toggleFeaturedCollection(c.slug)}
                />
                <span>{c.name}</span>
              </label>
            ))}
            {collections.length === 0 && (
              <p className="text-xs text-muted-foreground">No collections yet.</p>
            )}
          </div>
        </div>

        <Button type="submit" variant="luxe" className="w-full">
          Save Homepage Content
        </Button>
      </form>
    </div>
  );
}

/* =========================================================================
   9. STORE SETTINGS TAB
   ========================================================================= */
function SettingsManagerTab() {
  const { settings, updateSettings } = useStore();
  const [shippingThreshold, setShippingThreshold] = useState(
    String(settings.freeShippingThreshold),
  );
  const [shippingFee, setShippingFee] = useState(String(settings.shippingFee));
  const [codMax, setCodMax] = useState(String(settings.codMaxOrderValue));
  const [materials, setMaterials] = useState(settings.catalogMaterials.join(", "));
  const [colors, setColors] = useState(settings.catalogColors.join(", "));
  const [sizes, setSizes] = useState(settings.catalogSizes.join(", "));
  const [categories, setCategories] = useState(settings.catalogCategories.join(", "));

  // Settings load asynchronously (GET /api/settings) after this tab's
  // initial render — resync the form once the real values arrive, in case
  // an admin has changed them from the schema defaults shown as a placeholder.
  useEffect(() => {
    setShippingThreshold(String(settings.freeShippingThreshold));
    setShippingFee(String(settings.shippingFee));
    setCodMax(String(settings.codMaxOrderValue));
    setMaterials(settings.catalogMaterials.join(", "));
    setColors(settings.catalogColors.join(", "));
    setSizes(settings.catalogSizes.join(", "));
    setCategories(settings.catalogCategories.join(", "));
  }, [settings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSettings({
        freeShippingThreshold: Number(shippingThreshold),
        shippingFee: Number(shippingFee),
        codMaxOrderValue: Number(codMax),
        catalogMaterials: materials
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        catalogColors: colors
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        catalogSizes: sizes
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        catalogCategories: categories
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      });
      toast.success("Store settings updated successfully");
    } catch {
      toast.error("Couldn't update store settings. Please try again.");
    }
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

        <div>
          <Label htmlFor="catalog-materials">Catalog Materials</Label>
          <Input
            id="catalog-materials"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            placeholder="Silk, Cotton, Linen"
            className="mt-1 rounded-none"
          />
        </div>

        <div>
          <Label htmlFor="catalog-colors">Catalog Colors</Label>
          <Input
            id="catalog-colors"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="Ivory, Gold, Rose"
            className="mt-1 rounded-none"
          />
        </div>

        <div>
          <Label htmlFor="catalog-sizes">Catalog Sizes</Label>
          <Input
            id="catalog-sizes"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            placeholder="XS, S, M, L, XL"
            className="mt-1 rounded-none"
          />
        </div>

        <div>
          <Label htmlFor="catalog-categories">Catalog Categories</Label>
          <Input
            id="catalog-categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Sarees, Lehengas, Gowns"
            className="mt-1 rounded-none"
          />
        </div>

        <Button type="submit" variant="luxe" className="w-full">
          Save Store Configuration
        </Button>
      </form>
    </div>
  );
}
