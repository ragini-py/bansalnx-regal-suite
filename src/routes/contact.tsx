import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Us | Bansal-nx" },
      { name: "description", content: "Reach the Bansal-nx atelier in Jaipur for orders, styling advice or press enquiries." },
      { property: "og:title", content: "Contact Us | Bansal-nx" },
      { property: "og:description", content: "Reach the Bansal-nx atelier in Jaipur for orders, styling advice or press enquiries." },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  subject: z.string().trim().min(1, "Subject is required").max(120, "Too long"),
  message: z.string().trim().min(10, "Please add a little more detail").max(2000, "Too long"),
});

type FormValues = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

function ContactPage() {
  const { settings } = useStore();
  const [values, setValues] = useState<FormValues>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      toast.success("Message sent — our team will reply within one business day.");
      setValues({ name: "", email: "", subject: "", message: "" });
    }, 700);
  }

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={<Breadcrumbs items={[{ label: "Home", href: <Link to="/">Home</Link> }, { label: "Contact" }]} />}
        title="Contact Us"
        description="We're here for styling advice, order questions and everything in between."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <form className="space-y-5" onSubmit={submit} noValidate>
            <h2 className="text-2xl">Send us a message</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  className="mt-1.5 rounded-none"
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <p id="name-error" className="mt-1.5 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1.5 rounded-none"
                  value={values.email}
                  onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <p id="email-error" className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                className="mt-1.5 rounded-none"
                value={values.subject}
                onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject && <p id="subject-error" className="mt-1.5 text-xs text-destructive">{errors.subject}</p>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                className="mt-1.5 rounded-none"
                value={values.message}
                onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && <p id="message-error" className="mt-1.5 text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" variant="luxe" size="luxe" disabled={loading}>
              {loading ? "Sending…" : "Send message"}
            </Button>
          </form>

          <div>
            <h2 className="text-2xl">The atelier</h2>
            <dl className="mt-6 space-y-6 text-sm leading-relaxed">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Address</dt>
                  <dd className="mt-1">
                    Bansal-nx Atelier, C-Scheme,
                    <br />
                    Jaipur, Rajasthan 302001, India
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${settings.supportEmail}`} className="link-underline">
                      {settings.supportEmail}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${settings.supportPhone}`} className="link-underline">
                      {settings.supportPhone}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Hours</dt>
                  <dd className="mt-1">Monday – Saturday, 10:00 AM – 7:00 PM IST</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
