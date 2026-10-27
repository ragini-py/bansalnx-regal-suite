import { Link } from "react-router-dom";
import { Check, MapPin } from "lucide-react";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";

const steps = [
  {
    title: "1. Request Return",
    body: "Go to Account → Orders or your Order Confirmation page within 7 days of delivery and submit your return request with a brief reason.",
  },
  {
    title: "2. Pack Securely",
    body: "Keep the garments unworn and unwashed with all original designer tags and packaging intact.",
  },
  {
    title: "3. Ship Parcel to Our Kolkata Atelier",
    body: "Dispatch your parcel via Speed Post, DTDC, Blue Dart, or any postal/courier service of your choice to our central facility address below.",
  },
  {
    title: "4. Quality Inspection",
    body: "Once the shipment reaches our Kolkata facility, our master craftspeople inspect the garment to verify original condition.",
  },
  {
    title: "5. Immediate Refund Issued",
    body: "After the parcel reaches our facility and inspection is cleared, your refund is immediately processed back to your original payment method (or bank transfer for COD).",
  },
];

export function ReturnsPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Returns" }]}
          />
        }
        title="Returns & Exchanges"
        description="A considered, transparent process for a considered purchase."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-0">
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Unused pieces in their original condition, with tags attached, are eligible for return
            within 7 days of delivery. Made-to-order and customised pieces are final sale unless
            defective on arrival. Exchanges for a different size are subject to availability.
          </p>
          <p>
            To start a return, go to <span className="text-foreground">Account → Orders</span>, open
            the order and choose "Request Return". Refunds are issued to the original payment
            method; cash-on-delivery orders are refunded to a bank account you provide.
          </p>
        </div>

        <h2 className="mt-14 text-xl font-bold text-foreground">Return Status &amp; Fulfillment Flow</h2>
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
                <p className="text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Return Destination Address Box */}
        <div className="mt-12 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Return Shipping Destination Address (Final Step)
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Please pack your return securely and ship the parcel via <strong>Speed Post, India Post, Blue Dart, DTDC, or any courier / postal service of your choice</strong> to our central atelier:
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-4 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed shadow-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">Bansal NX (Returns &amp; Quality Dept)</p>
                <p>2nd Flr, Rm No. 38, 134/1,</p>
                <p>Mahatma Gandhi Rd, Central Avenue,</p>
                <p>Kolutolla, Kolkata, West Bengal 700073</p>
                <p className="text-amber-850 font-mono text-xs pt-1">
                  Website: bansalnx.in · Concierge: care@bansalnx.in
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>
                  Once your parcel reaches our Kolkata facility and clears quality inspection, your refund will be immediately processed and credited to you.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
