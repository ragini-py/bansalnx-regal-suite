import { Link } from "react-router-dom";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { useStore } from "@/lib/store";

export function TermsPage() {
  const { settings } = useStore();
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Terms of Service" }]} />}
        title="Terms of Service"
        description="The terms that govern your use of Bansal-nx."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-0">
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-xl text-foreground">Using our site</h2>
            <p className="mt-3">
              By browsing or placing an order on {settings.brandName}, you agree to these terms. We
              may update this page from time to time; continued use of the site after a change
              constitutes acceptance of the revised terms.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Orders &amp; pricing</h2>
            <p className="mt-3">
              All prices are listed in Indian Rupees (INR) and inclusive of applicable taxes unless
              stated otherwise. We reserve the right to refuse or cancel an order — for example in
              cases of pricing errors, suspected fraud, or unavailable stock — and will notify you if
              this happens.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Made-to-order &amp; custom pieces</h2>
            <p className="mt-3">
              Ceremonial and bespoke garments are cut and finished specifically for your order. These
              pieces are final sale unless received defective or materially different from what was
              ordered — see our{" "}
              <Link to="/returns" className="link-underline text-foreground">
                Returns &amp; Exchanges
              </Link>{" "}
              policy for details.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Intellectual property</h2>
            <p className="mt-3">
              All product photography, designs, and site content belong to {settings.brandName} and
              may not be reproduced without written permission.
            </p>
          </div>
          <div>
            <h2 className="text-xl text-foreground">Contact</h2>
            <p className="mt-3">
              Questions about these terms can be sent to{" "}
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
