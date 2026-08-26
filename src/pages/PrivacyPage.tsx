import { Link } from "react-router-dom";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { useStore } from "@/lib/store";

export function PrivacyPage() {
  const { settings } = useStore();
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Privacy Policy" }]} />}
        title="Privacy Policy"
        description="How we handle your personal information."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-0">
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-xl text-foreground">What we collect</h2>
            <p className="mt-3">
              When you create an account, place an order, or contact us, we collect information such
              as your name, email, phone number, delivery addresses, and order history. This is used
              solely to process your orders and provide customer support.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">How we use it</h2>
            <p className="mt-3">
              Your information is used to fulfil and ship orders, process payments, communicate order
              updates, and — with your consent — send you offers and new arrivals. We do not sell
              your personal data to third parties.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Payments</h2>
            <p className="mt-3">
              Card and UPI payments are processed by our payment gateway partner; we do not store your
              full card details on our servers.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Your choices</h2>
            <p className="mt-3">
              You can review and update your saved addresses and profile details from your account at
              any time, and unsubscribe from marketing emails using the link in any newsletter.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Contact</h2>
            <p className="mt-3">
              For any privacy-related questions or requests, write to us at{" "}
              <a href={`mailto:${settings.supportEmail}`} className="link-underline text-foreground">
                {settings.supportEmail}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
