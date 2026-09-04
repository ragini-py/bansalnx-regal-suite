import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2, Search } from "lucide-react";

import { AccountGate, AccountLayout, AccountLoading } from "@/components/account/AccountLayout";
import { EmptyState } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
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
import type { OrderStatus } from "@/data/types";
import { formatDate, formatINR } from "@/lib/format";
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
                "border border-border/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground",
                "data-[active]:border-gold data-[active]:text-foreground",
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
            className="rounded-none pl-9"
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
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="flex flex-col gap-3 border border-border/70 bg-card p-5 transition-colors hover:border-gold"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm">{order.id}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {order.lines.map((l) => l.name).join(", ")}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-none">
                    {orderStatusLabels[order.status]}
                  </Badge>
                  <Badge variant="outline" className="rounded-none">
                    {paymentStatusLabels[order.payment.status]}
                  </Badge>
                </div>
                <p className="text-sm">{formatINR(order.total)}</p>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="mt-8 hidden border border-border/70 lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Shipping</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell colSpan={7} className="p-0">
                      <Link
                        to={`/order/${order.id}`}
                        className="grid grid-cols-7 items-center gap-2 px-4 py-4 text-sm hover:bg-secondary/40"
                      >
                        <span>{order.id}</span>
                        <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                        <span
                          className="truncate text-muted-foreground"
                          title={order.lines.map((l) => l.name).join(", ")}
                        >
                          {order.lines.map((l) => l.name).join(", ")}
                        </span>
                        <span>{formatINR(order.total)}</span>
                        <span>
                          <Badge variant="outline" className="rounded-none">
                            {paymentStatusLabels[order.payment.status]}
                          </Badge>
                        </span>
                        <span>
                          <Badge variant="outline" className="rounded-none">
                            {orderStatusLabels[order.status]}
                          </Badge>
                        </span>
                        <span className="flex items-center justify-between">
                          {shipmentStatusLabel(order.status)}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </AccountLayout>
  );
}
