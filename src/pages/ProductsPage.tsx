import { Link, useSearchParams } from "react-router-dom";
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
import { allSizes } from "@/data/catalog";
import { useStore } from "@/lib/store";
import type { Product } from "@/data/types";

interface ProductSearch {
  q?: string;
  sort?: string;
  category?: string;
  collection?: string;
  size?: string;
  colour?: string;
}

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best sellers" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest saving" },
];

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, collections, categories } = useStore();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const allColours = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colours))).sort(),
    [products],
  );
  // Uses backend persisted categories if available, falling back to any legacy
  // category string present in loaded products.
  const liveCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c) => ({ slug: c.slug, name: c.name, id: c.id }));
    }
    const names = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
    return names.map((name) => ({ slug: slug(name), name, id: slug(name) }));
  }, [categories, products]);
  const liveSizes = useMemo(() => {
    const present = new Set(products.flatMap((p) => p.sizes));
    const known = allSizes.filter((s) => present.has(s));
    const extra = Array.from(present)
      .filter((s) => !allSizes.includes(s))
      .sort();
    return [...known, ...extra];
  }, [products]);

  const search: ProductSearch = useMemo(
    () => ({
      q: searchParams.get("q") || undefined,
      sort: searchParams.get("sort") || undefined,
      category: searchParams.get("category") || undefined,
      collection: searchParams.get("collection") || undefined,
      size: searchParams.get("size") || undefined,
      colour: searchParams.get("colour") || undefined,
    }),
    [searchParams],
  );

  const setSearch = (patch: Partial<ProductSearch>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, val]) => {
          if (val) {
            next.set(key, val);
          } else {
            next.delete(key);
          }
        });
        return next;
      },
      { replace: true },
    );
  };

  const selectedSizes = useMemo(() => (search.size ? search.size.split(",") : []), [search.size]);
  const selectedColours = useMemo(
    () => (search.colour ? search.colour.split(",") : []),
    [search.colour],
  );

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
    if (search.category) {
      const targetCategory = categories.find(
        (c) => c.slug === search.category || c.id === search.category,
      );
      const searchCatNorm = search.category.toLowerCase().replace(/[^a-z0-9]/g, "");
      list = list.filter((p) => {
        if (targetCategory) {
          if (p.categoryIds && p.categoryIds.includes(targetCategory.id)) return true;
          if (slug(p.category) === targetCategory.slug) return true;
        }
        const pCatNorm = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          pCatNorm === searchCatNorm ||
          pCatNorm.includes(searchCatNorm) ||
          searchCatNorm.includes(pCatNorm) ||
          slug(p.category) === search.category ||
          Boolean(p.categoryIds && p.categoryIds.includes(search.category!))
        );
      });
    }
    if (search.collection) list = list.filter((p) => p.collections.includes(search.collection!));
    if (selectedSizes.length)
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedColours.length)
      list = list.filter((p) => p.colours.some((c) => selectedColours.includes(c)));

    const sorted = [...list];
    switch (search.sort) {
      case "best-selling":
        sorted.sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
        break;
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
  }, [
    products,
    categories,
    search.q,
    search.category,
    search.collection,
    search.sort,
    selectedSizes,
    selectedColours,
  ]);

  const activeCount =
    (search.category ? 1 : 0) +
    (search.collection ? 1 : 0) +
    selectedSizes.length +
    selectedColours.length;

  const toggleList = (key: "size" | "colour", value: string) => {
    const current = key === "size" ? selectedSizes : selectedColours;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setSearch({ [key]: next.length ? next.join(",") : undefined });
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
          {liveCategories.map((cat) => (
            <li key={cat.slug}>
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
          {liveSizes.map((size) => (
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
              {
                label: "Home",
                href: (
                  <Link to="/" className="link-underline">
                    Home
                  </Link>
                ),
              },
              { label: "Shop All" },
            ]}
          />
        }
        title={search.q ? `Results for “${search.q}”` : "Shop All"}
        description="Every piece is handcrafted to perfection in Jaipur. Allow four to six weeks for custom ceremonial styles."
        meta={
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {results.length} {results.length === 1 ? "piece" : "pieces"}
          </p>
        }
      />

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-12 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
          <aside className="hidden w-64 shrink-0 lg:block">
            <h2 className="eyebrow mb-8">Refine</h2>
            {filterPanel}
          </aside>

          <div className="min-w-0 flex-1">
            {/* Mobile & Desktop Action Toolbar */}
            <div className="mb-6 space-y-3 border-b border-border pb-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Mobile 2-column controls (Filters + Sort) */}
                <div className="grid grid-cols-2 gap-2 lg:hidden">
                  <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="luxeOutline"
                        size="sm"
                        className="h-10 w-full justify-center text-xs tracking-wider font-medium"
                      >
                        <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                        Filters{activeCount ? ` (${activeCount})` : ""}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col p-0">
                      <SheetHeader className="border-b border-border px-6 py-4">
                        <SheetTitle className="text-left font-display text-2xl font-light">
                          Refine
                        </SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto px-6 py-6">{filterPanel}</div>
                      <div className="sticky bottom-0 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-2">
                        {activeCount > 0 && (
                          <Button
                            variant="luxeOutline"
                            size="sm"
                            onClick={clearAll}
                            className="flex-1 text-xs"
                          >
                            Reset
                          </Button>
                        )}
                        <Button
                          variant="luxe"
                          size="sm"
                          onClick={() => setFiltersOpen(false)}
                          className="flex-1 text-xs font-medium"
                        >
                          Show {results.length} Pieces
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select
                    value={search.sort ?? "featured"}
                    onValueChange={(value) => setSearch({ sort: value })}
                  >
                    <SelectTrigger
                      id="sort-mobile"
                      className="h-10 w-full rounded-none border-border text-xs uppercase tracking-[0.14em]"
                    >
                      <SelectValue placeholder="Sort" />
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

                {/* Desktop Sort on the right */}
                <div className="hidden lg:flex lg:items-center lg:gap-3 lg:ml-auto">
                  <Label
                    htmlFor="sort-desktop"
                    className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    Sort
                  </Label>
                  <Select
                    value={search.sort ?? "featured"}
                    onValueChange={(value) => setSearch({ sort: value })}
                  >
                    <SelectTrigger
                      id="sort-desktop"
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

              {/* Active Filter Chips (Scrollable row) */}
              {activeCount > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                  {search.category && (
                    <Chip
                      label={
                        liveCategories.find((c) => c.slug === search.category)?.name ?? "Category"
                      }
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
                  <button
                    type="button"
                    onClick={clearAll}
                    className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground underline underline-offset-2 px-2"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {results.length ? (
              <ProductGrid products={results} columns={3} />
            ) : (
              <EmptyState
                title="Nothing matches that yet"
                description="Try removing a filter or exploring the full catalogue — we add new pieces weekly."
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
