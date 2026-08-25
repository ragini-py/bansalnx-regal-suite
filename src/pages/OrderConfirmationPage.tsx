import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Mail, PackageSearch } from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { EmptyState } from "@/components/common/SectionHeading";
import { PeacockGlyph } from "@/components/brand/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Order } from "@/data/types";

function paymentStatusBadge(order: Order) {
  if (order.payment.method === "cod") {
    return <Badge variant="outline" className="rounded-none border-gold/50 text-gold-deep">COD — Payment Pending</Badge>;
  }
  if (order.payment.status === "processing") {
    return (
      <Badge variant="outline" className="rounded-none border-gold/50 text-gold-deep">
        Processing — awaiting server confirmation
      </Badge>
    );
  }
  if (order.payment.status === "paid") {
    return <Badge variant="outline" className="rounded-none border-emerald/50 text-emerald">Paid</Badge>;
  }
  return <Badge variant="outline" className="rounded-none">{order.payment.status}</Badge>;
}

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id);

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

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Order Confirmed" }]} />
        }
        title="Thank you"
        description={`Order ${order.id} has been placed.`}
      />

      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
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
            <p className="mt-3 text-sm capitalize">{order.payment.method === "cod" ? "Cash on Delivery" : "Razorpay"}</p>
            <div className="mt-2">{paymentStatusBadge(order)}</div>
          </div>
          <div className="border border-border p-6">
            <p className="eyebrow">Estimated Delivery</p>
            <p className="mt-3 text-sm">
              {order.shipment.estimatedDelivery ? formatDate(order.shipment.estimatedDelivery) : "To be confirmed"}
            </p>
          </div>
        </div>

        <div className="mt-8 border border-border p-6">
          <p className="eyebrow">Order Summary</p>
          <ul className="mt-4 divide-y divide-border">
            {order.lines.map((line, i) => (
              <li key={`${line.productId}-${i}`} className="flex gap-4 py-4">
                <img src={line.image} alt={line.name} className="h-20 w-16 shrink-0 object-cover" />
                <div className="flex-1 text-sm">
                  <p>{line.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    {line.size} · {line.colour} · Qty {line.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatINR(line.price * line.quantity)}</span>
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
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 border border-border p-6">
          <p className="eyebrow">Delivery Address</p>
          <p className="mt-3 text-sm">{order.address.fullName} · {order.address.phone}</p>
          <p className="text-sm text-muted-foreground">
            {order.address.line1}, {order.address.locality}, {order.address.city}, {order.address.state}{" "}
            {order.address.pincode}, {order.address.country}
          </p>
        </div>

        <div className="mt-8 flex items-start gap-4 border border-dashed border-border bg-muted/30 p-6">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            <p>
              A confirmation email is queued for <strong className="text-foreground">{order.email}</strong>. It will include the
              customer name, order number, products/variants/quantities, subtotal, discount, shipping, total,
              payment method and status, delivery address, estimated delivery, and View/Track order buttons.
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.15em]">
              The transactional email provider is not yet connected — this is an integration-ready state.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="luxe" size="luxe" className="flex-1">
            <Link to="/account/orders">View Order</Link>
          </Button>
          <Button asChild variant="luxeOutline" size="luxe" className="flex-1">
            <Link to={`/track?id=${encodeURIComponent(order.id)}`}>Track Order</Link>
          </Button>
          <Button asChild variant="luxeOutline" size="luxe" className="flex-1">
            <Link to="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
