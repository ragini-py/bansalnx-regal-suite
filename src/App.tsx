import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import { StoreProvider } from "@/lib/store";
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { CollectionsPage } from "@/pages/CollectionsPage";
import { CollectionDetailPage } from "@/pages/CollectionDetailPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { AboutPage } from "@/pages/AboutPage";
import { FaqsPage } from "@/pages/FaqsPage";
import { ContactPage } from "@/pages/ContactPage";
import { ReturnsPage } from "@/pages/ReturnsPage";
import { ShippingPage } from "@/pages/ShippingPage";
import { TermsPage } from "@/pages/TermsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { AccountPage } from "@/pages/AccountPage";
import { AccountOrdersPage } from "@/pages/AccountOrdersPage";
import { AdminPage } from "@/pages/AdminPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import { TrackPage } from "@/pages/TrackPage";
import { WishlistPage } from "@/pages/WishlistPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<CollectionDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Unified Dashboard Entry Point */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />

          {/* Account Routes */}
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<AccountOrdersPage />} />
          <Route path="/account/orders/:id" element={<OrderConfirmationPage />} />
          <Route path="/account/coupons" element={<AccountPage />} />
          <Route path="/account/addresses" element={<AccountPage />} />
          <Route path="/account/profile" element={<AccountPage />} />

          {/* Admin Management Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />

          {/* Utility Routes */}
          <Route path="/order/:id" element={<OrderConfirmationPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
