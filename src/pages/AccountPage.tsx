import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { AccountGate, AccountLayout } from "@/components/account/AccountLayout";
import { EmptyState } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { orderStatusLabels, paymentStatusLabels } from "@/data/mock";
import { formatDate, formatINR } from "@/lib/format";
import { useStore } from "@/lib/store";

export function AccountPage() {
  const { isAuthenticated, user, myOrders, wishlist, coupons } = useStore();

  if (!isAuthenticated || !user) return <AccountGate />;

  const recentOrders = [...myOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const mostRecentOrder = recentOrders[0];
  const activeCoupons = coupons.filter((c) => c.active && new Date(c.expiresAt) >= new Date());

  const cards = [
    {
      label: "Most Recent Order",
      value: mostRecentOrder ? mostRecentOrder.id : "No orders yet",
      sub: mostRecentOrder ? orderStatusLabels[mostRecentOrder.status] : "Start shopping",
      to: mostRecentOrder ? `/order/${mostRecentOrder.id}` : "/account/orders",
    },
    {
      label: "Wishlist",
      value: `${wishlist.length}`,
      sub: wishlist.length === 1 ? "Saved item" : "Saved items",
      to: "/wishlist",
    },
    {
      label: "Coupons",
      value: `${activeCoupons.length}`,
      sub: "Available to use",
      to: "/account/coupons",
    },
    {
      label: "Addresses",
      value: `${user.addresses.length}`,
      sub: "Saved addresses",
      to: "/account/addresses",
    },
  ] as const;

  return (
    <AccountLayout title="My Account" description={`Welcome back, ${user.firstName}.`}>
      <h2 className="font-display text-2xl">Hello, {user.firstName}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Here's a snapshot of your account.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="group flex flex-col justify-between border border-border/70 bg-card p-5 transition-colors hover:border-gold"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 font-display text-2xl">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-gold-deep">
              View <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl">Recent Orders</h3>
          <Link
            to="/account/orders"
            className="link-underline text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No orders yet."
              description="Your placed orders will appear here."
              action={
                <Link to="/products" className="text-[11px] uppercase tracking-[0.2em] text-gold-deep">
                  Shop Now
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/order/${order.id}`}
                  className="flex flex-col gap-4 border border-border/70 bg-card p-5 transition-colors hover:border-gold sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {order.lines.slice(0, 3).map((line, i) => (
                        <img
                          key={`${line.productId}-${i}`}
                          src={line.image}
                          alt=""
                          className="h-14 w-14 border border-border bg-muted object-cover"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant="outline" className="rounded-none">
                      {orderStatusLabels[order.status]}
                    </Badge>
                    <Badge variant="outline" className="rounded-none">
                      {paymentStatusLabels[order.payment.status]}
                    </Badge>
                    <span className="text-sm">{formatINR(order.total)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AccountLayout>
  );
}
