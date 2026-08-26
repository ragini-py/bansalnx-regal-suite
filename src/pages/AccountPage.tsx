import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";

import { AccountGate, AccountLayout } from "@/components/account/AccountLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderStatusLabels } from "@/data/mock";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

type AccountTab = "overview" | "addresses" | "coupons" | "profile";

const TAB_TITLES: Record<AccountTab, string> = {
  overview: "My Account",
  addresses: "Delivery Addresses",
  coupons: "Exclusive Offers",
  profile: "Profile & Credentials",
};

function tabFromPathname(pathname: string): AccountTab {
  const segment = pathname.replace(/^\/account\/?/, "").split("/")[0];
  if (segment === "addresses" || segment === "coupons" || segment === "profile") return segment;
  return "overview";
}

export function AccountPage() {
  const location = useLocation();
  const activeTab = tabFromPathname(location.pathname);
  const { isAuthenticated, user, myOrders, wishlist, coupons, addAddress, removeAddress } = useStore();

  const [addAddressOpen, setAddAddressOpen] = useState(false);

  if (!isAuthenticated || !user) return <AccountGate />;

  const activeCoupons = coupons.filter((c) => c.active && new Date(c.expiresAt) >= new Date());

  function handleCreateAddress(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    addAddress({
      label: String(data.get("label") || "Home"),
      fullName: String(data.get("fullName")),
      phone: String(data.get("phone")),
      line1: String(data.get("line1")),
      locality: String(data.get("locality")),
      city: String(data.get("city")),
      state: String(data.get("state")),
      pincode: String(data.get("pincode")),
      country: "India",
      isDefault: user?.addresses.length === 0,
    });
    toast.success("Delivery address added");
    setAddAddressOpen(false);
  }

  return (
    <AccountLayout title={TAB_TITLES[activeTab]} description={activeTab === "overview" ? `Welcome back, ${user.firstName}.` : undefined}>
      <div>
        {/* 1. OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">Welcome, {user.firstName}</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Manage your orders, saved pieces, and delivery addresses from your account.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/account/orders"
                className="group flex flex-col justify-between border border-slate-200 bg-white p-5 rounded-xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</p>
                  <p className="mt-2 font-display font-bold text-2xl text-slate-900">{myOrders.length}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {myOrders.length > 0 ? "Track or view recent" : "No orders yet"}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                  View Orders <ChevronRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                to="/wishlist"
                className="group flex flex-col justify-between border border-slate-200 bg-white p-5 rounded-xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Saved Wishlist</p>
                  <p className="mt-2 font-display font-bold text-2xl text-slate-900">{wishlist.length}</p>
                  <p className="mt-1 text-xs text-slate-400">Saved handcrafted pieces</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                  View Wishlist <ChevronRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                to="/account/coupons"
                className="group flex flex-col justify-between border border-slate-200 bg-white p-5 rounded-xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Exclusive Offers</p>
                  <p className="mt-2 font-display font-bold text-2xl text-slate-900">{activeCoupons.length}</p>
                  <p className="mt-1 text-xs text-slate-400">Promo discounts available</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                  Claim Codes <ChevronRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                to="/account/addresses"
                className="group flex flex-col justify-between border border-slate-200 bg-white p-5 rounded-xl text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivery Addresses</p>
                  <p className="mt-2 font-display font-bold text-2xl text-slate-900">{user.addresses.length}</p>
                  <p className="mt-1 text-xs text-slate-400">Saved locations</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                  Manage Addresses <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>

            {/* Recent Orders Snapshot */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl">Recent Orders</h3>
                {myOrders.length > 0 && (
                  <Link to="/account/orders" className="text-xs uppercase tracking-[0.15em] text-gold-deep link-underline">
                    View All Orders
                  </Link>
                )}
              </div>
              {myOrders.length === 0 ? (
                <div className="mt-4 border border-border/60 p-8 text-center bg-card">
                  <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
                  <Button asChild variant="luxe" size="sm" className="mt-4">
                    <Link to="/products">Explore Catalog</Link>
                  </Button>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {myOrders.slice(0, 3).map((o) => (
                    <li key={o.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border/70 bg-card p-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{o.id}</span>
                          <Badge variant="outline" className="rounded-none text-xs capitalize">{orderStatusLabels[o.status] || o.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDateTime(o.createdAt)} · {o.lines.length} item(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatINR(o.total)}</span>
                        <Button asChild variant="luxeOutline" size="sm">
                          <Link to={`/order/${o.id}`}>Order Details</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 2. ADDRESSES */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl">Delivery Addresses</h2>
                <p className="text-xs text-muted-foreground">Manage your shipping destinations for bespoke deliveries.</p>
              </div>
              <Button variant="luxe" size="sm" onClick={() => setAddAddressOpen(true)}>
                <Plus className="h-4 w-4" /> Add Address
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {user.addresses.map((addr) => (
                <div key={addr.id} className="border border-border/80 bg-card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.15em] font-medium text-gold-deep">{addr.label}</span>
                      {addr.isDefault && (
                        <Badge variant="outline" className="border-gold/50 text-gold-deep rounded-none text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium">{addr.fullName}</p>
                    <p className="text-xs text-muted-foreground">{addr.phone}</p>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {addr.line1}, {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        removeAddress(addr.id);
                        toast.success("Address removed");
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Address Modal */}
            {addAddressOpen && (
              <Dialog open={addAddressOpen} onOpenChange={setAddAddressOpen}>
                <DialogContent className="max-w-lg rounded-none border border-border bg-background p-6">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">Add Delivery Address</DialogTitle>
                    <DialogDescription>Add a new shipping address to your account.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAddress} className="mt-4 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="label">Address Nickname (e.g. Home, Office)</Label>
                      <Input id="label" name="label" defaultValue="Home" className="mt-1 rounded-none" required />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" name="fullName" defaultValue={user.firstName + " " + user.lastName} className="mt-1 rounded-none" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" defaultValue={user.phone} className="mt-1 rounded-none" required />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="line1">Address Line</Label>
                      <Input id="line1" name="line1" placeholder="Flat, building, street" className="mt-1 rounded-none" required />
                    </div>
                    <div>
                      <Label htmlFor="locality">Locality</Label>
                      <Input id="locality" name="locality" className="mt-1 rounded-none" required />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" className="mt-1 rounded-none" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" className="mt-1 rounded-none" required />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" name="pincode" className="mt-1 rounded-none" required />
                    </div>
                    <Button type="submit" variant="luxe" className="col-span-2 mt-2">
                      Save Address
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* 3. COUPONS */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl">Available Exclusive Offers</h2>
              <p className="text-xs text-muted-foreground">Copy promo codes to claim discounts at checkout.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {activeCoupons.map((c) => (
                <div key={c.id} className="border border-gold/40 bg-gold/5 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-medium tracking-wider text-gold-deep">{c.code}</span>
                      <span className="text-xs uppercase tracking-[0.1em] text-emerald font-medium">
                        {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Valid on orders above {formatINR(c.minOrder ?? 0)} · Expires {formatDate(c.expiresAt)}
                    </p>
                  </div>
                  <Button
                    variant="luxeOutline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      toast.success(`Copied code ${c.code} to clipboard`);
                    }}
                  >
                    Copy Promo Code
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="font-display text-2xl">Profile &amp; Credentials</h2>
              <p className="text-xs text-muted-foreground">Your account details and contact preferences.</p>
            </div>

            <div className="border border-border/80 bg-card p-6 space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={`${user.firstName} ${user.lastName}`} disabled className="mt-1 rounded-none bg-muted/40" />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input value={user.email} disabled className="mt-1 rounded-none bg-muted/40" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input value={user.phone} disabled className="mt-1 rounded-none bg-muted/40" />
              </div>
              <div>
                <Label>Account Tier</Label>
                <Input value={user.role === "customer" ? "Valued Client (Bespoke Tier)" : `Staff Member (${user.role})`} disabled className="mt-1 rounded-none bg-muted/40" />
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
