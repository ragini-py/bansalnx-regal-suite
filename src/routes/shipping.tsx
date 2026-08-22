import { createFileRoute, Link } from "@tanstack/react-router";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/shipping")({
  component: ShippingPage,
  head: () => ({
    meta: [
      { title: "Shipping Policy | Bansal-nx" },
      { name: "description", content: "Dispatch windows, made-to-order timelines and shipping charges for Bansal-nx orders." },
      { property: "og:title", content: "Shipping Policy | Bansal-nx" },
      { property: "og:description", content: "Dispatch windows, made-to-order timelines and shipping charges for Bansal-nx orders." },
    ],
  }),
});

function ShippingPage() {
  const { settings } = useStore();
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Shipping" }]} />}
        title="Shipping Policy"
        description="How and when your order reaches you."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-0">
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-xl text-foreground">Dispatch windows</h2>
            <p className="mt-3">
              In-stock pieces are dispatched within 1–3 business days of order confirmation.
              Made-to-order pieces are cut, embroidered and finished by our karigars once your order
              is placed, and typically dispatch in 7–14 business days depending on the craft
              involved; the estimated timeline is shown on the product page before you buy.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Shipping charges</h2>
            <p className="mt-3">
              Orders above {formatINR(settings.freeShippingThreshold)} ship free across India. Orders
              below this threshold carry a flat shipping fee of {formatINR(settings.shippingFee)}.
              {settings.codEnabled && ` A COD handling fee of ${formatINR(settings.codFee)} applies to cash-on-delivery orders.`}
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Courier partner</h2>
            <p className="mt-3">
              Deliveries are fulfilled through Delhivery. Live tracking and automated status updates
              are pending final integration with our courier partner — order pages currently show the
              latest status we have on file.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">International shipping</h2>
            <p className="mt-3">
              We currently ship within India. For international orders, please write to us at{" "}
              <a href={`mailto:${settings.supportEmail}`} className="link-underline text-foreground">
                {settings.supportEmail}
              </a>{" "}
              and our team will arrange a bespoke shipping quote.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
