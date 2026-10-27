import { Link } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";

const faqs = [
  {
    q: "Who is Bansal NX and what is CHAMAK?",
    a: "Bansal NX has been redefining women's fashion for over 15 years as a premier manufacturer of ethnic and contemporary wear in Kolkata. To extend our design philosophy to a wider audience, we introduced CHAMAK, a signature brand that celebrates authentic Indian craftsmanship with a contemporary approach for today's modern woman.",
  },
  {
    q: "Where are your garments manufactured?",
    a: "Every Bansal NX and CHAMAK collection is designed and manufactured in-house at our Kolkata atelier located at 2nd Flr, Rm No. 38, 134/1, Mahatma Gandhi Rd, Central Avenue, Kolutolla, Kolkata, West Bengal 700073 (bansalnx.in). From fabric selection and pattern design to hand embroidery and final stitching, every step is strictly supervised for superior quality and comfort.",
  },
  {
    q: "Do you supply to retailers, wholesalers, and overseas buyers?",
    a: "Yes! Bansal NX supplies to over 1,000+ retail partners and 20+ wholesalers and major traders across India and international markets. For commercial distribution and stockist queries, please contact our team via the Contact page.",
  },
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
    a: "Unused items with original tags, within 7 days of delivery, can be returned from Account → Orders or your Order page. Ship the parcel via Speed Post, DTDC, Blue Dart, or any courier to our Kolkata atelier: 2nd Flr, Rm No. 38, 134/1, Mahatma Gandhi Rd, Central Avenue, Kolutolla, Kolkata, West Bengal 700073 (bansalnx.in). Once the garment reaches our facility and clears quality inspection, your refund will be immediately processed.",
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
        breadcrumb={
          <Breadcrumbs
            items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "FAQs" }]}
          />
        }
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
