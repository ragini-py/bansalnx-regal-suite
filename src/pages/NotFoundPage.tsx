import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import { SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <SiteLayout>
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 py-24 text-center">
        <Compass className="h-12 w-12 stroke-1 text-gold" />
        <h1 className="mt-6 font-display text-4xl">Page Not Found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="luxe" size="luxe">
            <Link to="/">Return Home</Link>
          </Button>
          <Button asChild variant="luxeOutline" size="luxe">
            <Link to="/products">Explore Collections</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
