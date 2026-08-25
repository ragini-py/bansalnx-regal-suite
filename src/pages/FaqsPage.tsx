import { Link } from "react-router-dom";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";

const faqs = [
  {
    q: "How do I find my correct size?",
    a: "Each product page includes a size guide with garment measurements. If you're between sizes, we recommend sizing up for structured silhouettes, or writing to us with your measurements for guidance.",
  },
  {
    q: "What does 'made-to-order' mean?",
    a: "Made-to-order pieces are cut and finished by our karigars only after you place your order, rather than pulled from ready stock. This typically takes 7–14 business days before dispatch, shown on the product page.",
  },
  {
    q: "Is Cash on Delivery available?",
    a: "Yes, COD is available on eligible orders up to a maximum order value, with a small handling fee applied at checkout. Availability is shown on the checkout page based on your order and pincode.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major cards, UPI and net banking via Razorpay, as well as Cash on Delivery where eligible. Card and bank details are never stored on our servers.",
  },
  {
    q: "How do I return or exchange an item?",
    a: "Unused items with tags, within 7 days of delivery, can be returned from Account → Orders. Made-to-order and customised pieces are final sale unless defective. See our Returns & Exchanges page for the full process.",
  },
  {
    q: "How should I care for my garment?",
    a: "Care instructions are listed on each product page. As a general rule, hand-wash or dry-clean embellished and hand-embroidered pieces, and store folded in breathable cotton bags away from direct sunlight.",
  },
  {
    q: "Do I need an account to shop?",
    a: "You can browse and add to your wishlist as a guest, but you'll need an account to check out, so we can keep your order history, saved addresses and wishlist in one place.",
  },
  {
    q: "Can I track my order?",
    a: "Yes — order status and shipment updates are available on your order details page under Account → Orders once your order has been dispatched.",
  },
  {
    q: "I forgot my password. What now?",
    a: "Use 'Forgot password' on the sign-in page to receive a reset link by email. The link is valid for 30 minutes.",
  },
];

export function FaqsPage() {
  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "FAQs" }]} />}
        title="Frequently Asked Questions"
        description="Everything you might want to know before, during and after your order."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:px-0">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
