import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Loader2, Package, Search, Truck } from "lucide-react";

import { AccountGate, AccountLayout, AccountLoading } from "@/components/account/AccountLayout";
import { EmptyState } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderStatusLabels, paymentStatusLabels } from "@/data/mock";
import type { Order, OrderStatus } from "@/data/types";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; statuses: OrderStatus[] | null }[] = [
  { label: "All", statuses: null },
  { label: "Processing", statuses: ["confirmed", "processing", "packed", "ready_for_pickup"] },
  { label: "Shipped", statuses: ["shipped", "in_transit", "out_for_delivery"] },
  { label: "Delivered", statuses: ["delivered"] },
  { label: "Cancelled", statuses: ["cancelled", "delivery_failed", "ndr", "rto", "lost"] },
];

function shipmentStatusLabel(status: OrderStatus) {
  if (["shipped", "in_transit", "out_for_delivery"].includes(status)) return "In transit";
  if (status === "delivered") return "Delivered";
  if (["ndr", "rto", "delivery_failed", "lost"].includes(status)) return "Exception";
  if (status === "cancelled") return "Cancelled";
  return "Not shipped";
}

export function AccountOrdersPage() {
  const { isAuthenticated, authReady, myOrders, ordersLoading } = useStore();
  const [filter, setFilter] = useState(FILTERS[0]?.label ?? "All");
  const [query, setQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    const active = FILTERS.find((f) => f.label === filter);
    let list = [...myOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    if (active?.statuses) list = list.filter((o) => active.statuses!.includes(o.status));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((o) => o.id.toLowerCase().includes(q));
    }
    return list;
  }, [myOrders, filter, query]);

  if (!authReady) return <AccountLoading />;
  if (!isAuthenticated) return <AccountGate />;

  return (
    <AccountLayout title="My Orders" description="Track, review and manage your orders.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFilter(f.label)}
              data-active={filter === f.label || undefined}
              className={cn(
                "border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer rounded-lg",
                "data-[active]:border-slate-900 data-[active]:bg-slate-900 data-[active]:text-white font-medium",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order ID"
            aria-label="Search by order ID"
            className="rounded-lg pl-9"
          />
        </div>
      </div>

      {ordersLoading ? (
        <div className="mt-8 flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders yet."
            description="Orders matching this filter will appear here."
          />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="mt-8 flex flex-col gap-4 lg:hidden">
            {filtered.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="flex flex-col gap-3 border border-border/70 bg-card p-5 rounded-xl shadow-xs transition-colors hover:border-slate-400 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.lines.map((l) => l.name).join(", ")}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[11px]">
                    {orderStatusLabels[order.status]}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[11px]">
                    {paymentStatusLabels[order.payment.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-bold text-slate-900">{formatINR(order.total)}</p>
                  <span className="text-xs text-amber-700 font-medium">Click to inspect →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-8 hidden border border-slate-200 bg-white rounded-xl shadow-xs overflow-x-auto lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/60">
                  <TableHead className="text-xs font-semibold text-slate-600">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Products</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Total</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Payment</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Order Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Shipping</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-600">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <TableCell className="font-semibold text-slate-900 text-xs">{order.id}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-xs text-slate-700 max-w-[200px] truncate" title={order.lines.map((l) => l.name).join(", ")}>
                      {order.lines.map((l) => l.name).join(", ")}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900">{formatINR(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full text-[11px] font-medium border-slate-200 bg-slate-50 text-slate-700">
                        {paymentStatusLabels[order.payment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full text-[11px] font-semibold capitalize",
                          order.status === "delivered" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                          ["ndr", "rto", "cancelled"].includes(order.status) && "border-rose-200 bg-rose-50 text-rose-700",
                          !["delivered", "ndr", "rto", "cancelled"].includes(order.status) && "border-slate-200 bg-slate-50 text-slate-700",
                        )}
                      >
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {shipmentStatusLabel(order.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
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
        </>
      )}

      {/* Customer Order Details Modal */}
      {selectedOrder && (
        <Dialog
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2 pr-6">
                <div>
                  <DialogTitle className="font-display text-xl font-bold text-slate-900">
                    Order {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-1">
                    Placed on {formatDateTime(selectedOrder.createdAt)}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="rounded-full text-xs capitalize">
                    {orderStatusLabels[selectedOrder.status]}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs capitalize">
                    {selectedOrder.payment.status}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-5 space-y-6">
              {/* Order Items */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ordered Items ({selectedOrder.lines.length})
                </p>
                <ul className="mt-3 divide-y divide-slate-200/80">
                  {selectedOrder.lines.map((line, idx) => (
                    <li key={idx} className="flex items-center justify-between py-2.5 text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-12 w-10 object-cover rounded-md border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{line.name}</p>
                          <p className="text-xs text-slate-500">
                            Size: {line.size} · Colour: {line.colour} · Qty: {line.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900">{formatINR(line.price * line.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-base text-amber-700">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Delivery Address
                  </p>
                  <div className="mt-2 text-xs text-slate-700 space-y-0.5 leading-relaxed">
                    <p className="font-semibold text-slate-900">{selectedOrder.address.fullName}</p>
                    <p>{selectedOrder.address.line1}, {selectedOrder.address.locality}</p>
                    <p>{selectedOrder.address.city}, {selectedOrder.address.state} — {selectedOrder.address.pincode}</p>
                    <p className="text-slate-500">Phone: {selectedOrder.address.phone}</p>
                  </div>
                </div>
              )}

              {/* Tracking / Logistics */}
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-700" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Shipment Status
                    </p>
                  </div>
                  {selectedOrder.shipment?.awb ? (
                    <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      AWB: {selectedOrder.shipment.awb}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Not dispatched yet</span>
                  )}
                </div>
                {selectedOrder.shipment?.events && selectedOrder.shipment.events.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    {selectedOrder.shipment.events.map((evt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">{evt.label}</p>
                          <p className="text-[11px] text-slate-400">{evt.location} · {formatDateTime(evt.at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="luxe" size="sm" className="flex-1">
                  <Link to={`/order/${selectedOrder.id}`}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Full Order &amp; Invoice Page
                  </Link>
                </Button>
                {selectedOrder.shipment?.awb && (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/track?id=${selectedOrder.id}&email=${encodeURIComponent(selectedOrder.email)}`}>
                      <Truck className="h-3.5 w-3.5 mr-1.5" />
                      Track Live Package
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AccountLayout>
  );
}
