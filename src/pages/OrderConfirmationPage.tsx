import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Loader2,
  Mail,
  PackageSearch,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { OrderCancelDialog } from "@/components/account/OrderCancelDialog";
import { EmptyState } from "@/components/common/SectionHeading";
import { PeacockGlyph } from "@/components/brand/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const CANCELLABLE_STATUSES: OrderStatus[] = [
  "confirmed",
  "processing",
  "packed",
  "ready_for_pickup",
];

function paymentStatusBadge(order: Order) {
  if (order.status === "cancelled") {
    if (order.payment.status === "refunded") {
      return (
        <Badge variant="outline" className="rounded-none border-emerald-500/50 text-emerald-700 bg-emerald-50">
          Refund Initiated
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="rounded-none border-slate-300 text-slate-600 bg-slate-50">
        Order Cancelled
      </Badge>
    );
  }

  if (order.payment.method === "cod") {
    return (
      <Badge variant="outline" className="rounded-none border-gold/50 text-gold-deep">
        COD — Payment Pending
      </Badge>
    );
  }
  if (order.payment.status === "processing") {
    return (
      <Badge variant="outline" className="rounded-none border-gold/50 text-gold-deep">
        Processing — awaiting server confirmation
      </Badge>
    );
  }
  if (order.payment.status === "paid") {
    return (
      <Badge variant="outline" className="rounded-none border-emerald/50 text-emerald">
        Paid
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-none">
      {order.payment.status}
    </Badge>
  );
}

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { myOrders, orders, ordersLoading, authReady, requestReturn, addToCart, setCartDrawerOpen } =
    useStore();
  const order = myOrders.find((o) => o.id === id) || orders.find((o) => o.id === id);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  async function handleRequestReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!order || !returnReason.trim()) return;
    try {
      await requestReturn(order.id, returnReason.trim());
      toast.success("Return request submitted — our concierge team will review within 24 hours.");
      setReturnOpen(false);
      setReturnReason("");
    } catch {
      toast.error("Couldn't submit the return request. Please try again.");
    }
  }

  function handleReorderItems() {
    if (!order) return;
    for (const line of order.lines) {
      addToCart({
        productId: line.productId,
        size: line.size,
        colour: line.colour,
        quantity: line.quantity,
      });
    }
    toast.success("Items added back to your bag");
    setCartDrawerOpen(true);
  }

  if (!order && (!authReady || ordersLoading)) {
    return (
      <SiteLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SiteLayout>
    );
  }

  if (!order) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-5 py-24 sm:px-8">
          <EmptyState
            icon={<PackageSearch className="h-8 w-8" strokeWidth={1} />}
            title="We couldn't find that order."
            description="Double-check the order link, or view your orders from your account."
            action={
              <Button asChild variant="luxe" size="luxe">
                <Link to="/products">Continue Shopping</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  const isCancelled = order.status === "cancelled";
  const isPrepaid = order.payment.status === "refunded" || order.payment.status === "paid" || order.payment.method !== "cod";
  const cancelledEvent = order.shipment.events?.find((e) => e.status === "cancelled");

  // Calculate estimated refund date for display (5-7 business days)
  const refundEstimatedDate = (() => {
    const d = new Date(cancelledEvent?.at || order.createdAt);
    d.setDate(d.getDate() + 6);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: <Link to="/">Home</Link> },
              { label: "Account", href: <Link to="/account/orders">My Orders</Link> },
              { label: isCancelled ? "Order Cancelled" : "Order Confirmed" },
            ]}
          />
        }
        title={isCancelled ? "Order Cancelled" : "Thank you"}
        description={
          isCancelled
            ? `Order #${order.id} was cancelled. No further action is needed.`
            : `Order ${order.id} has been placed.`
        }
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {/* ==================================================== */}
        {/* CANCELLED ORDER VIEW                                */}
        {/* ==================================================== */}
        {isCancelled ? (
          <div className="space-y-8 animate-[fade-up_0.5s_ease-out]">
            {/* Cancelled Hero Banner */}
            <div className="flex flex-col items-center text-center border border-rose-200/80 bg-rose-50/40 rounded-2xl p-6 sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                <RotateCcw className="h-8 w-8 stroke-[1.75]" />
              </div>
              <span className="mt-4 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold tracking-wider uppercase text-rose-800">
                Order Cancelled
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl text-slate-900">
                This Order Has Been Cancelled
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-md">
                {cancelledEvent?.at
                  ? `Cancelled on ${formatDateTime(cancelledEvent.at)}.`
                  : `Placed on ${formatDateTime(order.createdAt)}.`}{" "}
                The shipment has been halted and items released back to Jaipur inventory.
              </p>

              {/* Cancellation Reason Notice */}
              {cancelledEvent?.label && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white border border-rose-200/90 px-4 py-2 text-xs text-slate-700 shadow-2xs">
                  <span className="font-semibold text-rose-800">Cancellation Reason:</span>
                  <span>{cancelledEvent.label.replace(/^Cancelled:\s*/, "")}</span>
                </div>
              )}
            </div>

            {/* Refund & Settlement Details Card */}
            <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    Refund &amp; Settlement Status
                  </h3>
                </div>
                {paymentStatusBadge(order)}
              </div>

              {isPrepaid ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-slate-500 font-medium">Refund Amount</p>
                      <p className="text-base font-bold text-amber-800 mt-1">{formatINR(order.total)}</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">100% Full Refund</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-slate-500 font-medium">Settlement Destination</p>
                      <p className="font-semibold text-slate-900 mt-1 truncate">
                        {order.payment.method === "razorpay"
                          ? "Original Source (Razorpay/Bank)"
                          : "Original Payment Mode"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Direct to source account</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-slate-500 font-medium">Expected Settlement Date</p>
                      <p className="font-semibold text-slate-900 mt-1">{refundEstimatedDate}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">5–7 banking days</p>
                    </div>
                  </div>

                  {/* 3-Step Refund Lifecycle */}
                  <div className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      Refund Lifecycle Progress
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-950">1. Cancellation Approved</p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">Confirmed by system</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-950">2. Refund Initiated</p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">Processed to payment gateway</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs">
                        <Clock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-950">3. Credit to Bank / Card</p>
                          <p className="text-[11px] text-amber-800 mt-0.5">Credited within 5–7 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5 text-blue-950">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                    Cash on Delivery Notice — Zero Deduction
                  </p>
                  <p className="text-[11px] text-blue-900/80 leading-relaxed">
                    Because this order was placed with Cash on Delivery, zero payment was collected from you. The order has been closed and no cancellation fee has been charged.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Reorder Action Banner */}
            <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  Changed your mind or want to re-order?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  You can easily add all items from this order back into your bag with one click.
                </p>
              </div>
              <Button
                type="button"
                variant="luxe"
                size="sm"
                onClick={handleReorderItems}
                className="shrink-0 w-full sm:w-auto"
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Reorder These Items
              </Button>
            </div>
          </div>
        ) : (
          /* ==================================================== */
          /* NORMAL CONFIRMED ORDER VIEW                         */
          /* ==================================================== */
          <>
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 text-gold animate-[fade-up_0.8s_ease-out]">
                <PeacockGlyph className="h-12 w-12 opacity-90 transition-transform duration-700 ease-out" />
                <CheckCircle2
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background text-gold transition-transform duration-500"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="mt-6 font-display text-2xl sm:text-3xl">Your order is confirmed</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Placed on {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="border border-border p-6">
                <p className="eyebrow">Payment</p>
                <p className="mt-3 text-sm capitalize">
                  {order.payment.method === "cod" ? "Cash on Delivery" : "Razorpay"}
                </p>
                <div className="mt-2">{paymentStatusBadge(order)}</div>
              </div>
              <div className="border border-border p-6">
                <p className="eyebrow">Estimated Delivery</p>
                <p className="mt-3 text-sm">
                  {order.shipment.estimatedDelivery
                    ? formatDate(order.shipment.estimatedDelivery)
                    : "To be confirmed"}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ==================================================== */}
        {/* COMMON ORDER SUMMARY & ITEMS                        */}
        {/* ==================================================== */}
        <div className="mt-8 border border-border p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Order Summary</p>
            {isCancelled && (
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Items Cancelled
              </span>
            )}
          </div>
          <ul className="mt-4 divide-y divide-border">
            {order.lines.map((line, i) => (
              <li
                key={`${line.productId}-${i}`}
                className={cn("flex gap-4 py-4", isCancelled && "opacity-80")}
              >
                <img
                  src={line.image}
                  alt={line.name}
                  className="h-20 w-16 shrink-0 object-cover rounded-md border border-slate-200"
                />
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-slate-900">{line.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                    {line.size} · {line.colour} · Qty {line.quantity}
                  </p>
                  {isCancelled && (
                    <span className="inline-block mt-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      Cancelled
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold">{formatINR(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gold-deep">
                <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                <dd>-{formatINR(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping &amp; fees</dt>
              <dd>{order.shippingFee === 0 ? "Complimentary" : formatINR(order.shippingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt>Total {isCancelled ? "Refunded / Voided" : "Paid"}</dt>
              <dd className={isCancelled ? "text-amber-800" : ""}>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Delivery Address */}
        <div className="mt-8 border border-border p-6">
          <p className="eyebrow">Delivery Address</p>
          <p className="mt-3 text-sm">
            {order.address.fullName} · {order.address.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.address.line1}, {order.address.locality}, {order.address.city},{" "}
            {order.address.state} {order.address.pincode}, {order.address.country}
          </p>
        </div>

        {/* Cancellation CTA for Cancellable Orders */}
        {!isCancelled && CANCELLABLE_STATUSES.includes(order.status) && (
          <div className="mt-8 border border-border p-6">
            <p className="eyebrow">Need to make a change?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You can cancel this order before it leaves the Jaipur warehouse dispatch.
            </p>
            <Button
              variant="luxeOutline"
              size="sm"
              className="mt-4 text-rose-700 border-rose-200 hover:bg-rose-50"
              onClick={() => setCancelDialogOpen(true)}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Cancel Order
            </Button>
          </div>
        )}

        {/* Delivered Order Returns CTA */}
        {order.status === "delivered" && (
          <div className="mt-8 border border-border p-6">
            <p className="eyebrow">Returns &amp; Exchanges</p>
            {order.returnRequest ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="rounded-none border-gold/50 text-gold-deep capitalize"
                >
                  Return: {order.returnRequest.status}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Reason: {order.returnRequest.reason}
                </p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Not quite right? You can request a return or size exchange within 7 days of
                  delivery.
                </p>
                <Button
                  variant="luxeOutline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setReturnOpen(true)}
                >
                  Request Return
                </Button>
              </>
            )}
          </div>
        )}

        {/* Email Notification Reassurance */}
        <div className="mt-8 flex items-start gap-4 border border-dashed border-border bg-muted/30 p-6">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p>
              {isCancelled ? (
                <>
                  A formal cancellation confirmation and refund advice document have been sent to{" "}
                  <strong className="text-foreground">{order.email}</strong>.
                </>
              ) : (
                <>
                  A confirmation email with your order summary and a tracking link has been sent to{" "}
                  <strong className="text-foreground">{order.email}</strong>.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="luxe" size="luxe" className="flex-1">
            <Link to="/account/orders">View All Orders</Link>
          </Button>
          {!isCancelled && (
            <Button asChild variant="luxeOutline" size="luxe" className="flex-1">
              <Link
                to={`/track?id=${encodeURIComponent(order.id)}&email=${encodeURIComponent(order.email)}`}
              >
                Track Order
              </Link>
            </Button>
          )}
          <Button asChild variant="luxeOutline" size="luxe" className="flex-1">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>

      {returnOpen && (
        <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
          <DialogContent className="max-w-md rounded-none border border-border bg-background p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Request Order Return</DialogTitle>
              <DialogDescription>Order {order.id} · 7-day return window</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestReturn} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="return-reason">Reason for Return or Size Exchange</Label>
                <textarea
                  id="return-reason"
                  rows={4}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Size fitting issue, request size L replacement"
                  className="mt-1 w-full border border-border bg-transparent p-3 text-sm focus:border-gold focus:outline-none"
                  required
                />
              </div>
              <Button type="submit" variant="luxe" className="w-full">
                Submit Return Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Real E-Commerce Order Cancellation Dialog */}
      <OrderCancelDialog
        order={order}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
      />
    </SiteLayout>
  );
}
