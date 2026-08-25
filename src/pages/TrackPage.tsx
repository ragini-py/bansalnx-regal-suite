import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, PackageSearch, Search } from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { EmptyState } from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatDateTime } from "@/lib/format";
import { trackingStages } from "@/data/mock";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const EXCEPTION_STATUSES: OrderStatus[] = ["cancelled", "delivery_failed", "ndr", "rto", "lost"];

export function TrackPage() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id") || undefined;
  const { orders, settings } = useStore();

  const [orderId, setOrderId] = useState(idParam ?? "");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Order | null | undefined>(undefined);
  const [searched, setSearched] = useState(false);

  function lookup(id: string, mail: string) {
    const match = orders.find(
      (o) => o.id.toLowerCase() === id.trim().toLowerCase() && (!mail.trim() || o.email.toLowerCase() === mail.trim().toLowerCase()),
    );
    setResult(match ?? null);
    setSearched(true);
  }

  useEffect(() => {
    if (idParam) {
      setOrderId(idParam);
      lookup(idParam, "");
    }
  }, [idParam]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    lookup(orderId, email);
  }

  const exception = result && EXCEPTION_STATUSES.includes(result.status);
  const currentIndex = result
    ? trackingStages.findIndex((s) => s.status === result.status)
    : -1;

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Track Order" }]} />}
        title="Track Your Order"
        description="Enter your order number and email to see the latest status."
      />

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 border border-border p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="order-id">Order number</Label>
            <Input id="order-id" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="BNX-24081" className="mt-1 rounded-none" />
          </div>
          <div>
            <Label htmlFor="order-email">Email</Label>
            <Input id="order-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 rounded-none" />
          </div>
          <Button type="submit" variant="luxe" size="luxe">
            <Search className="h-4 w-4" /> Track
          </Button>
        </form>

        {searched && result === null && (
          <div className="mt-10">
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" strokeWidth={1} />}
              title="We couldn't find that order."
              description="Please check the order number and email address, then try again."
            />
          </div>
        )}

        {result && (
          <div className="mt-10 space-y-8">
            <div className="grid grid-cols-2 gap-4 border border-border p-6 text-sm sm:grid-cols-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Courier</p>
                <p className="mt-1">{result.shipment.courier ?? "Not yet assigned"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">AWB</p>
                <p className="mt-1">{result.shipment.awb ?? "Pending"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Shipment ID</p>
                <p className="mt-1">{result.shipment.shipmentId ?? "Pending"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Attempts</p>
                <p className="mt-1">{result.shipment.attempts}</p>
              </div>
              <div className="col-span-2 sm:col-span-4">
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Estimated delivery</p>
                <p className="mt-1">
                  {result.shipment.estimatedDelivery ? formatDate(result.shipment.estimatedDelivery) : "To be confirmed"}
                </p>
              </div>
              {!settings.delhiveryConnected && (
                <p className="col-span-2 text-[11px] text-muted-foreground sm:col-span-4">
                  Live carrier tracking activates once Delhivery is connected.
                </p>
              )}
            </div>

            {exception ? (
              <div className="border border-destructive/40 bg-destructive/5 p-6">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-display text-lg">
                    {trackingStages.find((s) => s.status === result.status)?.label ?? result.status}
                  </p>
                </div>
                {result.shipment.ndrReason && (
                  <p className="mt-3 text-sm text-muted-foreground">Reason: {result.shipment.ndrReason}</p>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  Our team has been notified and will reach out with next steps.
                </p>
              </div>
            ) : (
              <ol className="relative border-l border-border pl-6">
                {trackingStages.map((stage, i) => {
                  const event = result.shipment.events.find((e) => e.status === stage.status);
                  const completed = i <= currentIndex && !!event;
                  const isCurrent = i === currentIndex;
                  return (
                    <li key={stage.status} className="mb-8 last:mb-0">
                      <span
                        className={cn(
                          "absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border",
                          completed ? "border-gold bg-gold" : "border-border bg-background",
                          isCurrent && "ring-2 ring-gold/40",
                        )}
                      >
                        {completed && <CheckCircle2 className="h-3 w-3 text-ink" strokeWidth={2.5} />}
                      </span>
                      <p
                        className={cn(
                          "text-sm",
                          isCurrent ? "font-medium text-foreground" : completed ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {stage.label}
                      </p>
                      {event && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDateTime(event.at)}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}

        {!searched && (
          <div className="mt-10">
            <EmptyState
              icon={<PackageSearch className="h-8 w-8" strokeWidth={1} />}
              title="Track any order"
              description="Enter your order number and email above to see live status and delivery timeline."
            />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
