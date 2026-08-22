import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, PackageCheck, Truck, PackageSearch } from "lucide-react";

import { AdminGuard, AdminLayout, AdminPage, StatusBadge } from "@/components/admin/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import { formatDateTime, formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Bansal-nx" },
      { name: "description", content: "Operational overview of orders, shipping and integrations." },
      { property: "og:title", content: "Admin Dashboard | Bansal-nx" },
      { property: "og:description", content: "Operational overview of orders, shipping and integrations." },
    ],
  }),
});

function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        <DashboardContent />
      </AdminLayout>
    </AdminGuard>
  );
}

function DashboardContent() {
  const { orders, settings, hasPermission } = useStore();

  const awaitingFulfilment = orders.filter((o) =>
    ["confirmed", "processing", "packed", "ready_for_pickup"].includes(o.status),
  );
  const inTransit = orders.filter((o) => ["shipped", "in_transit", "out_for_delivery"].includes(o.status));
  const delivered = orders.filter((o) => o.status === "delivered");
  const exceptions = orders.filter((o) => ["ndr", "rto", "delivery_failed", "lost"].includes(o.status));

  const needsAttention = orders.filter(
    (o) =>
      ["ndr", "rto"].includes(o.status) ||
      o.payment.status === "failed" ||
      (o.returnRequest && !["refund_completed", "rejected"].includes(o.returnRequest.status)),
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const tiles = [
    {
      key: "orders",
      label: "Awaiting fulfilment",
      value: awaitingFulfilment.length,
      icon: PackageSearch,
      tone: "info" as const,
    },
    {
      key: "shipping",
      label: "In transit",
      value: inTransit.length,
      icon: Truck,
      tone: "info" as const,
    },
    {
      key: "orders",
      label: "Delivered",
      value: delivered.length,
      icon: PackageCheck,
      tone: "success" as const,
    },
    {
      key: "shipping",
      label: "Exceptions",
      value: exceptions.length,
      icon: AlertTriangle,
      tone: "warning" as const,
    },
  ];

  return (
    <AdminPage title="Operational overview" description="Orders and shipping status at a glance — no analytics, just what needs doing.">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles
          .filter((t) => hasPermission(t.key as "orders" | "shipping"))
          .map((tile) => (
            <div key={tile.label} className="border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{tile.label}</p>
                <tile.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-display text-foreground">{tile.value}</p>
            </div>
          ))}
      </div>

      {hasPermission("orders") && (
        <div className="border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-foreground">Needs attention</h3>
            <span className="text-xs text-muted-foreground">{needsAttention.length} orders</span>
          </div>
          {needsAttention.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">Nothing needs attention right now.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsAttention.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>
                      {["ndr", "rto"].includes(o.status) && <StatusBadge status="warning" label={o.status.toUpperCase()} />}
                      {o.payment.status === "failed" && <StatusBadge status="destructive" label="Payment failed" />}
                      {o.returnRequest && <StatusBadge status="info" label={`Return: ${o.returnRequest.status}`} />}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to="/admin/orders" className="text-xs text-foreground link-underline">
                        Review
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {hasPermission("orders") && (
        <div className="border border-border bg-background">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-foreground">Recent orders</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <Link to="/admin/orders" className="link-underline">
                      {o.id}
                    </Link>
                  </TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{formatDateTime(o.createdAt)}</TableCell>
                  <TableCell>{formatINR(o.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status="muted" label={o.status.replace(/_/g, " ")} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="border border-border bg-background p-4">
        <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-foreground">Integrations</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <IntegrationRow label="Razorpay" connected={settings.razorpayConnected} />
          <IntegrationRow label="Delhivery" connected={settings.delhiveryConnected} />
          <IntegrationRow label="Transactional email" connected={settings.emailProviderConnected} />
        </div>
      </div>
    </AdminPage>
  );
}

function IntegrationRow({ label, connected }: { label: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between border border-border px-3 py-3">
      <span className="text-sm text-foreground">{label}</span>
      {connected ? (
        <StatusBadge status="success" label="Connected" />
      ) : (
        <StatusBadge status="muted" label="Not connected — integration ready" />
      )}
    </div>
  );
}
