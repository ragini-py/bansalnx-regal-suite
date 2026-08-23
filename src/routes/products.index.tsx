import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/SectionHeading";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { Breadcrumbs, PageHeader, SiteLayout } from "@/components/storefront/SiteLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { allColours, allSizes, categories } from "@/data/catalog";
import { useStore } from "@/lib/store";
import type { Product } from "@/data/types";

interface ProductSearch {
  q?: string | undefined;
  sort?: string | undefined;
  category?: string | undefined;
  collection?: string | undefined;
  size?: string | undefined;
  colour?: string | undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: str(search["q"]),
    sort: str(search["sort"]),
    category: str(search["category"]),
    collection: str(search["collection"]),
    size: str(search["size"]),
    colour: str(search["colour"]),
  }),

  head: () => ({
    meta: [
      { title: "Shop All Couture — Lehengas, Sarees & Gowns | Bansal-nx" },
      {
        name: "description",
        content:
          "Browse the full Bansal-nx catalogue: hand-embroidered lehengas, handloom sarees, silk gowns and kurta sets. Filter by category, size and colour.",
      },
      { property: "og:title", content: "Shop All Couture | Bansal-nx" },
      {
        property: "og:description",
        content: "The complete Bansal-nx catalogue, made to order in our Jaipur atelier.",
      },
    ],
  }),
  component: ProductsPage,
});

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest saving" },
];

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { products, collections } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setSearch = (patch: Partial<ProductSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  };

  const selectedSizes = search.size ? search.size.split(",") : [];
  const selectedColours = search.colour ? search.colour.split(",") : [];

  const results = useMemo(() => {
    let list = products.filter((p) => p.published);
    const q = search.q?.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.category, p.shortDescription, ...p.tags, ...p.colours]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (search.category) list = list.filter((p) => slug(p.category) === search.category);
    if (search.collection) list = list.filter((p) => p.collections.includes(search.collection!));
    if (selectedSizes.length)
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColours.length)
      list = list.filter((p) => p.colours.some((c) => selectedColours.includes(c)));

    const sorted = [...list];
    switch (search.sort) {
      case "newest":
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        sorted.sort((a, b) => saving(b) - saving(a));
        break;
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return sorted;
  }, [products, search.q, search.category, search.collection, search.sort, search.size, search.colour, selectedSizes, selectedColours]);

  const activeCount =
    (search.category ? 1 : 0) +
    (search.collection ? 1 : 0) +
    selectedSizes.length +
    selectedColours.length;

  const toggleList = (key: "size" | "colour", value: string) => {
    const current = key === "size" ? selectedSizes : selectedColours;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setSearch({ [key]: next.length ? next.join(",") : undefined } as Partial<ProductSearch>);
  };

  const clearAll = () =>
    setSearch({
      category: undefined,
      collection: undefined,
      size: undefined,
      colour: undefined,
    });

  const filterPanel = (
    <div className="space-y-10">
      <FilterGroup title="Category">
        <ul className="space-y-2.5">
          <li>
            <FilterRadio
              id="cat-all"
              label="All categories"
              checked={!search.category}
              onChange={() => setSearch({ category: undefined })}
            />
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <FilterRadio
                id={`cat-${cat.slug}`}
                label={cat.name}
                checked={search.category === cat.slug}
                onChange={() => setSearch({ category: cat.slug })}
              />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Collection">
        <ul className="space-y-2.5">
          <li>
            <FilterRadio
              id="col-all"
              label="All collections"
              checked={!search.collection}
              onChange={() => setSearch({ collection: undefined })}
            />
          </li>
          {collections
            .filter((c) => c.published)
            .map((c) => (
              <li key={c.id}>
                <FilterRadio
                  id={`col-${c.slug}`}
                  label={c.name}
                  checked={search.collection === c.slug}
                  onChange={() => setSearch({ collection: c.slug })}
                />
              </li>
            ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleList("size", size)}
              aria-pressed={selectedSizes.includes(size)}
              className="border border-border px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-gold hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-primary-foreground"
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <ul className="space-y-2.5">
          {allColours.map((colour) => (
            <li key={colour} className="flex items-center gap-3">
              <Checkbox
                id={`colour-${slug(colour)}`}
                checked={selectedColours.includes(colour)}
                onCheckedChange={() => toggleList("colour", colour)}
              />
              <Label
                htmlFor={`colour-${slug(colour)}`}
                className="text-sm font-normal text-muted-foreground"
              >
                {colour}
              </Label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      {activeCount > 0 && (
        <Button variant="luxeOutline" size="luxeSm" onClick={clearAll} className="w-full">
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <SiteLayout>
      <PageHeader
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: <Link to="/" className="link-underline">Home</Link> },
              { label: "Shop All" },
            ]}
          />
        }
        title={search.q ? `Results for “${search.q}”` : "Shop All"}
        description="Every piece is made to order in our Jaipur atelier. Allow four to six weeks for ceremonial styles."
        meta={
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
        }
      />

      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <aside className="hidden w-64 shrink-0 lg:block">
            <h2 className="eyebrow mb-8">Refine</h2>
            {filterPanel}
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="luxeOutline" size="luxeSm" className="lg:hidden">
                      <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                      Filters{activeCount ? ` (${activeCount})` : ""}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="font-display text-2xl font-light">Refine</SheetTitle>
                    </SheetHeader>
                    <div className="px-4 pb-10">{filterPanel}</div>
                  </SheetContent>
                </Sheet>

                {search.category && (
                  <Chip
                    label={categories.find((c) => c.slug === search.category)?.name ?? "Category"}
                    onRemove={() => setSearch({ category: undefined })}
                  />
                )}
                {search.collection && (
                  <Chip
                    label={
                      collections.find((c) => c.slug === search.collection)?.name ?? "Collection"
                    }
                    onRemove={() => setSearch({ collection: undefined })}
                  />
                )}
                {selectedSizes.map((s) => (
                  <Chip key={s} label={`Size ${s}`} onRemove={() => toggleList("size", s)} />
                ))}
                {selectedColours.map((c) => (
                  <Chip key={c} label={c} onRemove={() => toggleList("colour", c)} />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Label
                  htmlFor="sort"
                  className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block"
                >
                  Sort
                </Label>
                <Select
                  value={search.sort ?? "featured"}
                  onValueChange={(value) => setSearch({ sort: value })}
                >
                  <SelectTrigger
                    id="sort"
                    className="w-[190px] rounded-none border-border text-xs uppercase tracking-[0.14em]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {results.length ? (
              <ProductGrid products={results} columns={3} />
            ) : (
              <EmptyState
                title="Nothing matches that yet"
                description="Try removing a filter or exploring the full catalogue — the atelier adds new pieces weekly."
                action={
                  <Button variant="luxe" size="luxe" onClick={clearAll}>
                    Clear filters
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <h3 className="mb-4 text-xs uppercase tracking-[0.2em]">{title}</h3>
      {children}
    </div>
  );
}

function FilterRadio({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onChange}
      aria-pressed={checked}
      className="flex w-full items-center gap-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground aria-pressed:text-foreground"
    >
      <span
        aria-hidden="true"
        className={
          checked
            ? "h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
            : "h-1.5 w-1.5 shrink-0 rounded-full border border-border"
        }
      />
      {label}
    </button>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 border border-border bg-secondary/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-foreground">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function saving(product: Product) {
  return product.mrp > product.price ? (product.mrp - product.price) / product.mrp : 0;
}
