import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";

const steps = [
  { title: "Requested", body: "You raise a return from your order details page, with a reason." },
  { title: "Approved", body: "Our team reviews and approves the request." },
  { title: "Pickup scheduled", body: "A reverse pickup is scheduled with our courier partner." },
  { title: "Returned", body: "The item is collected and received back at our facility." },
  { title: "Refund initiated", body: "Quality check clears and your refund is initiated." },
  { title: "Refund completed", body: "Funds are credited to your original payment method." },
];

export function ReturnsPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Returns" }]} />}
        title="Returns & Exchanges"
        description="A considered process for a considered purchase."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-0">
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Unused pieces in their original condition, with tags attached, are eligible for return
            within 7 days of delivery. Made-to-order and customised pieces are final sale unless
            defective on arrival. Exchanges for a different size are subject to availability.
          </p>
          <p>
            To start a return, go to <span className="text-foreground">Account → Orders</span>,
            open the order and choose "Request Return". Refunds are issued to the original payment
            method; cash-on-delivery orders are refunded to a bank account you provide.
          </p>
        </div>

        <h2 className="mt-14 text-xl text-foreground">Return status flow</h2>
        <ol className="mt-6 space-y-0">
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
              {i < steps.length - 1 && (
                <span className="absolute left-3 top-7 h-full w-px bg-border" aria-hidden="true" />
              )}
              <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center border border-gold bg-background text-gold">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.1em] text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </SiteLayout>
  );
}
