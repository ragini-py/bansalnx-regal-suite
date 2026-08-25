# Bansal-nx Luxury

BANSAL-NX — COMPLETE ECOMMERCE FRONTEND UI/UX SPECIFICATION

Build a complete, premium, production-quality ecommerce frontend for Bansal-nx, a luxury fashion/lifestyle brand.

This is a real ecommerce application UI, not a landing-page mockup.

The frontend must cover the complete customer journey:

Discover → Browse → Product → Login/Register → Wishlist/Cart → Checkout → Payment/COD → Order → Email → Shipment → Tracking → Delivery

It must also include a complete admin dashboard with role-based access control UI.

The primary objective is:

Make the website look like a high-end luxury fashion ecommerce brand while keeping the implementation practical, maintainable, responsive, and integration-ready.

1. TECH STACK — NON-NEGOTIABLE

Use:

Next.js

React

TypeScript

Tailwind CSS

CRITICAL CSS RULE

Tailwind CSS utility classes are mandatory.

Do NOT use:

CSS files

CSS modules

styled-components

Emotion

<style> tags

style={{ ... }}

external custom stylesheet files

All styling must be implemented using Tailwind utility classes.

Use responsive Tailwind classes for all screen sizes.

Do not work around this requirement.

2. BRAND

Brand name

Bansal-nx

Tagline

CRAFTED FOR THE EXTRAORDINARY YOU

3. LOGO DESCRIPTION

The actual logo asset may not be available during the initial build.

Use this description to establish the visual identity:

The Bansal-nx logo features a stylized capital B that cleverly incorporates the head and neck of a peacock.

Behind the letter is a fan of detailed peacock feathers.

The brand name uses a metallic gold serif-inspired typeface.

The tagline appears beneath the brand name in uppercase.

The overall logo aesthetic is:

Regal

Artistic

Luxury

Elegant

Sophisticated

Feminine but not overly delicate

Do not create a generic ecommerce logo.

If the actual logo is unavailable, create a tasteful text-based brand treatment that can easily be replaced with the real logo asset later.

4. BRAND COLOR PALETTE

Primary luxury gold:

#C8A45A

Emerald teal:

#0F7B6C

Sapphire blue:

#1E4E8C

Leaf green:

#2B8E57

Royal purple:

#5B3A8E

Pearl light grey:

#E8E8E6

Additional neutral colors may be used for readability:

White

Ivory

Warm off-white

Charcoal

Deep near-black

Soft grey

COLOR USAGE

Gold should be the main luxury accent.

Emerald, sapphire, green and purple should be used sparingly.

Do NOT make the entire website colorful.

The overall visual impression should be:

Luxury + Fashion + Craftsmanship + Exclusivity

rather than:

Bright + Colorful + Generic ecommerce

5. DESIGN REFERENCES

Use the following websites as visual inspiration, especially for product presentation, luxury fashion layouts, typography hierarchy, product galleries, spacing, and ecommerce UX.

Reference:

https://pratapsons.com/products/pretty-pink-skirt-set

Reference:

https://uniqstree.com/products/golden-jacket-saree-ensemble

Do NOT clone their design.

Do NOT copy their layouts pixel-for-pixel.

Use them only to understand the level of polish and premium fashion presentation expected.

6. OVERALL VISUAL DIRECTION

The website should feel like an established luxury fashion brand.

Prioritize:

Editorial layouts

Elegant typography

Large fashion imagery

Generous whitespace

Premium product photography

Subtle gold accents

Refined borders

Sophisticated hover states

Clean grids

Strong visual hierarchy

High-quality spacing

Smooth transitions

Avoid:

Generic Shopify appearance

Generic SaaS dashboard aesthetics on the storefront

Excessive cards

Excessive rounded corners

Excessive shadows

Excessive gradients

Neon colors

Purple AI-style gradients

Overly playful illustrations

Huge unnecessary icons

Cluttered layouts

7. IMPORTANT IMAGE DIRECTION

Fashion imagery is a major part of the visual identity.

Do NOT build the site as mostly text + white backgrounds + product cards.

Create intentional spaces for elegant fashion imagery.

Examples:

Full-width editorial section

Large fashion image spanning the viewport with minimal overlay text.

Split editorial section

Image on one side.

Text and CTA on the other.

Collection feature

Large collection image with elegant title overlay.

Product storytelling

Large lifestyle/fashion image between product sections.

Promotional banner

High-quality fashion image with minimal typography.

Brand story

Elegant image + text describing craftsmanship.

Images should feel:

Editorial

Sophisticated

Fashion-focused

Premium

High quality

Use image aspect ratios intentionally.

Do not randomly place image placeholders everywhere.

The composition of the image and whitespace should be part of the design.

8. GLOBAL RESPONSIVENESS

The entire application must be responsive.

Design intentionally for:

320px

375px

390px

414px

768px

1024px

1280px

1440px+

Do not simply shrink desktop layouts.

Mobile layouts should be deliberately designed.

9. GLOBAL ANIMATION LANGUAGE

Use subtle premium animation throughout.

Examples:

Fade-ins

Slide-ins

Image zoom on hover

Product image transitions

Button transitions

Wishlist animation

Cart feedback

Modal transitions

Drawer transitions

Dropdown transitions

Page transitions

Scroll reveals

Skeleton loaders

Toast animations

Use Tailwind animation/transition utilities.

Avoid:

Excessive bouncing

Excessive parallax

Long animations

Distracting motion

Respect reduced-motion preferences.

10. GLOBAL NAVBAR

Create a premium responsive navbar.

Desktop

Include:

Logo

Home

Shop

Collections

Search

Wishlist

Account

Cart

Optional:

Announcement/promotion item

The navbar should feel elegant and spacious.

Do not overcrowd it.

Mobile

Use:

Hamburger

Logo

Search

Wishlist

Cart

The hamburger opens a polished animated drawer.

Drawer contains:

Shop

Collections

New Arrivals

Best Sellers

Account

Contact

Other relevant links

Show cart and wishlist counts.

11. ANNOUNCEMENT BAR

Create an elegant optional announcement bar.

Examples:

"Complimentary shipping on orders above ₹X"

"Exclusive first-order offer"

"New collection now available"

Make it configurable.

Admin should eventually be able to change its content or disable it.

12. FOOTER

Create a complete luxury footer.

Sections:

Shop

All Products

Collections

New Arrivals

Best Sellers

Customer Care

Contact

Shipping

Returns

FAQs

Track Order

Account

My Account

Orders

Wishlist

Company

About

Privacy Policy

Terms

Refund Policy

Newsletter

Email input.

Subscribe button.

Social

Social icons.

Brand

Bansal-nx logo/brand.

Tagline:

"CRAFTED FOR THE EXTRAORDINARY YOU"

13. HOMEPAGE

Create a visually impressive luxury homepage.

Section 1 — Hero

Full-width editorial fashion imagery.

Large elegant headline.

Short supporting text.

Primary CTA:

"SHOP NOW"

Secondary CTA:

"EXPLORE COLLECTIONS"

Use minimal text.

Do not cover the entire image with text.

The hero should immediately communicate luxury.

Section 2 — Featured Collections

Large visual collection cards.

Each card:

Image

Collection name

Short description

Explore CTA

Use sophisticated hover interactions.

Section 3 — New Arrivals

Premium product grid.

Include:

Product image

Name

Price

MRP

Discount

Wishlist

Availability

CTA:

"VIEW ALL NEW ARRIVALS"

Section 4 — Editorial Fashion Image

Large immersive image.

Minimal text.

Example:

"CRAFTED FOR THE EXTRAORDINARY YOU"

CTA:

"DISCOVER THE COLLECTION"

Section 5 — Featured Products

Curated product grid.

Section 6 — Brand Story

Split layout:

Image + text.

Talk about:

Craftsmanship

Design

Elegance

Individuality

CTA:

"OUR STORY"

Section 7 — Promotional Banner

Elegant fashion image.

Example:

"MAKE AN ENTRANCE"

CTA:

"SHOP THE EDIT"

Section 8 — Best Sellers

Product carousel/grid.

Section 9 — Newsletter

Premium newsletter section.

Email capture.

14. PRODUCTS PAGE

Route:

/products

Create a premium catalog experience.

Top:

Breadcrumb

Page title

Description

Product count

Controls:

Search

Filter

Sort

Desktop:

Filter sidebar.

Mobile:

Filter drawer.

Filters:

Category

Collection

Price

Size

Colour

Availability

Sorting:

Featured

Newest

Price low to high

Price high to low

Best selling

15. PRODUCT CARD

Product cards are extremely important.

Each card should contain:

Large product image

Product name

Price

MRP

Discount

Wishlist button

Badge

Possible badges:

New

Bestseller

Exclusive

Hover:

Slight image zoom

Secondary image if available

Subtle visual movement

Do not make cards visually cluttered.

16. PRODUCT DETAIL PAGE

This is one of the most important pages.

Take inspiration from the reference fashion websites.

Desktop:

Large image gallery on left.

Product information on right.

Mobile:

Image gallery first.

Product information below.

Include:

Breadcrumb

Product name

Price

MRP

Discount

Description

Size selector

Colour selector

Variant availability

Wishlist

Add to cart

Buy now

Shipping information

Returns information

Product details

Care information

Related products

17. PRODUCT IMAGE GALLERY

Make the gallery feel premium.

Support:

Main image

Thumbnail navigation

Multiple images

Image zoom

Smooth transitions

Mobile swipe

Images should have enough visual prominence.

Do not make product images tiny.

18. VARIANT SYSTEM

For now there is NO inventory management.

Use variant availability only.

Example:

XS — Available

S — Available

M — Unavailable

L — Available

XL — Unavailable

Unavailable variants:

Remain visible

Are visibly disabled

Cannot be selected

Cannot be purchased

Do NOT show stock quantities.

Do NOT show:

"Only 2 left"

Do NOT build inventory counters.

The architecture should allow inventory to be introduced later.

19. AUTHENTICATION UX

Authentication is required for:

Wishlist

Add to cart

Buy now

Checkout

Account

Orders

Addresses

Guests can browse products and collections.

20. LOGIN PROMPT

When a guest clicks Wishlist:

Show an elegant modal:

"Save your favourites"

"Sign in to save this piece to your wishlist."

Buttons:

Login

Create Account

When a guest clicks Add to Cart:

Show:

"Sign in to continue"

"Create an account to save your selections and continue shopping."

Buttons:

Login

Create Account

Do not abruptly redirect without context.

21. LOGIN PAGE

Route:

/login

Design as a premium split or centered authentication page.

Possible layout:

Left:

Elegant fashion image.

Right:

Authentication form.

Fields:

Email

Password

Actions:

Login

Forgot password

Create account

Include password visibility toggle.

Include validation states.

22. REGISTER PAGE

Route:

/register

Fields:

First name

Last name

Email

Phone

Password

Confirm password

Terms acceptance

CTA:

"Create Account"

Link:

"Already have an account? Sign in"

Use polished validation.

23. AUTH REDIRECT BEHAVIOUR

Preserve the user's intended action.

Example:

Guest clicks:

"Add to Wishlist"

→ login/register

→ authentication succeeds

→ return to product

→ complete wishlist action.

Similarly:

Add to Cart

→ authentication

→ return

→ complete cart action.

Do not lose the user's context.

24. FORGOT PASSWORD

Create:

/forgot-password

Include:

Email

Submit

Success state

Success message should explain that a reset email has been sent.

Also prepare:

/reset-password

25. WISHLIST

Route:

/wishlist

Logged-in users only.

Show:

Product image

Product name

Price

Variant availability

Add to cart

Remove

If an item becomes unavailable:

Clearly communicate it.

Empty wishlist should have an elegant empty state.

26. CART

Create both:

Cart drawer

Accessible from navbar.

Cart page

Show:

Product

Image

Variant

Quantity

Price

Remove

Wishlist

Summary:

Subtotal

Coupon

Shipping

Tax placeholder

Total

CTA:

"Proceed to Checkout"

27. CHECKOUT

Checkout should be clean and distraction-free.

Sections:

Contact

Email

Phone

Delivery address

Full name

Phone

Address

Locality

City

State

Pincode

Country

Allow saved addresses.

Delivery

Show shipping option.

Prepare for Delhivery integration.

Coupon

Coupon field.

Payment

Options:

Razorpay

Cash on Delivery

Order summary

Show:

Products

Variants

Quantity

Subtotal

Discount

Shipping

Total

28. RAZORPAY UI

Prepare the frontend for Razorpay.

Payment states:

Pending

Processing

Successful

Failed

Cancelled

Refunded

Do not expose secret credentials.

Do not claim payment success based solely on frontend state.

Prepare UI for server-side verification.

29. COD

Support Cash on Delivery.

COD should appear as a payment option.

Show clear payment messaging:

"Pay when your order is delivered."

Do not mark COD orders as paid.

Payment status:

"COD — Payment Pending"

Prepare for future:

Pincode restrictions

COD fee

Maximum COD value

30. FIRST VISITOR COUPON POPUP

Create an elegant first-visit popup.

Do not show it immediately in an aggressive way.

Use a tasteful delay/trigger.

Content:

"Welcome to Bansal-nx"

"Enjoy an exclusive offer on your first order."

Email input.

CTA:

"UNLOCK MY OFFER"

After submission:

Show success state

Display coupon

Explain how to use it

Avoid repeatedly showing popup

31. ORDER SUCCESS

After successful order creation:

Show:

Elegant success animation

Order number

Order summary

Payment method

Payment status

Delivery address

Estimated delivery

View Order

Track Order

Continue Shopping

32. ORDER EMAIL

After order placement, the architecture should support a confirmation email.

Email should contain:

Customer name

Order number

Products

Variants

Quantities

Subtotal

Discount

Shipping

Total

Payment method

Payment status

Delivery address

Estimated delivery

View order button

Track order button

Prepare architecture for future transactional email provider integration.

Additional future email events:

Payment confirmation

Order shipped

Out for delivery

Delivered

Cancellation

Return/refund

33. CUSTOMER DASHBOARD

Route:

/account

Create a premium account dashboard.

Overview cards:

Recent order

Wishlist

Coupons

Saved addresses

Navigation:

Overview

Orders

Wishlist

Addresses

Coupons

Profile

Settings

34. ORDERS

Route:

/account/orders

Order cards/table:

Order ID

Date

Products

Total

Payment status

Order status

Shipping status

Order details:

Products

Variants

Price

Address

Payment

Shipment

Tracking

Cancellation

Return/refund

35. SHIPPING / DELHIVERY UI

Prepare for Delhivery.

Do not fake live integration.

Order should support:

Courier

AWB

Shipment ID

Shipment status

Tracking URL

Estimated delivery

NDR

RTO

Delivery attempts

Tracking timeline:

Order Confirmed

↓

Processing

↓

Packed

↓

Ready for Pickup

↓

Shipped

↓

In Transit

↓

Out for Delivery

↓

Delivered

Exception states:

Cancelled

Delivery failed

NDR

RTO

Lost

Make the tracking timeline visually beautiful.

36. RETURNS AND REFUNDS

Prepare UI for:

Return request

Return status

Refund status

Refund amount

Statuses:

Requested

Approved

Rejected

Pickup scheduled

Returned

Refund initiated

Refund completed

37. ADMIN DASHBOARD

The admin should feel professional but visually distinct from the luxury storefront.

Use:

Clean navigation

Compact information hierarchy

Tables

Filters

Search

Forms

Status badges

Modals

Drawers

Do NOT build analytics.

No analytics dashboard.

No revenue charts.

No unnecessary graphs.

Focus on operational management.

38. ADMIN ROLES / RBAC

Implement role-based access control UI.

Suggested roles:

Super Admin

Full access.

Admin / Manager

Products

Collections

Coupons

Orders

Shipping

Content Manager

Homepage content

Editorial images

Banners

Collections

Product presentation

Order Manager

Orders

Shipping

Returns/refunds

The UI must reflect permissions.

More importantly:

Permissions must not only hide navigation items.

Unauthorized routes/actions must also be blocked.

Example:

A user without payment permissions must not be able to access:

/admin/payments

even by manually entering the URL.

Prepare the architecture so actual backend authorization can later enforce the same permissions.

39. ADMIN PRODUCTS

Route:

/admin/products

Show:

Product list

Search

Filter

Status

Collection

Category

Actions

Actions:

View

Edit

Duplicate

Publish/unpublish

Delete

Product editor:

Name

Description

Images

Price

MRP

Discount

Category

Collections

Tags

Sizes

Colours

Variant availability

Featured

Bestseller

New arrival

Visibility

40. ADMIN COLLECTIONS

Admin can:

Create

Edit

Delete

Publish

Unpublish

Feature

Reorder

Collection fields:

Name

Slug

Description

Cover image

Banner image

Products

41. ADMIN COUPONS

Admin can:

Create

Edit

Delete

Activate

Deactivate

Fields:

Code

Type

Discount

Minimum order

Maximum discount

Start date

Expiry

Usage limit

Per-user limit

Product restriction

Collection restriction

New customer only

42. ADMIN ORDERS

Show:

Order ID

Customer

Date

Total

Payment method

Payment status

Order status

Shipping status

AWB

Order details:

Customer

Products

Variants

Address

Payment

Shipping

Tracking

Cancellation

Return/refund

43. ADMIN PAYMENTS

Show:

Order

Customer

Payment method

Amount

Payment status

Razorpay payment ID

Transaction ID

Date

Refund status

Statuses:

Pending

Paid

Failed

Cancelled

Refunded

44. ADMIN SHIPPING

Prepare a shipping management page.

Show:

Orders awaiting shipment

Shipment status

AWB

Courier

Pickup

Tracking

NDR

RTO

Future actions:

Create shipment

Generate AWB

Generate label

Request pickup

Track shipment

If Delhivery is not connected, these should be clearly integration-ready states.

Do not pretend the API is live.

45. ADMIN CUSTOMERS

Show:

Customer

Email

Phone

Orders

Account status

Registration date

Customer details:

Profile

Orders

Wishlist

Addresses

Coupon usage

46. ADMIN CONTENT MANAGEMENT

Create basic content management UI.

Admin should eventually be able to configure:

Hero

Hero image

Promotional banner

Editorial image

Editorial text

Featured collections

Featured products

Homepage section visibility

Homepage section ordering

Announcement bar

Keep this simple.

Do not build a massive page builder.

47. ADMIN SETTINGS

Include basic settings for:

Store

Brand information

Contact information

Checkout

COD enabled

Razorpay enabled

Shipping threshold

Shipping

Shipping fee

Delhivery integration status

Homepage

Promotional content

Sections

Account

Customer account configuration

48. ERROR STATES

Every major flow needs polished error handling.

Examples:

Product unavailable

"Looks like this piece is no longer available."

Coupon

"That code isn't valid."

Payment

"We couldn't complete your payment."

Buttons:

"Try Again"

Network

"Something went wrong. Please try again."

Unauthorized

"You don't have permission to view this page."

49. EMPTY STATES

Create elegant empty states.

Examples:

Wishlist:

"Your favourites belong here."

Cart:

"Your bag is waiting."

Orders:

"No orders yet."

Search:

"No pieces found."

Collections:

"No collections available."

50. LOADING STATES

Use skeleton loaders for:

Product cards

Product detail

Collections

Orders

Dashboard

Tables

Avoid generic full-page spinners wherever a skeleton can be used.

51. TOASTS

Use polished toast notifications.

Examples:

Added to wishlist

Removed from wishlist

Added to bag

Coupon applied

Coupon removed

Address saved

Order placed

Product updated

Collection created

Payment status changed

52. DATA ARCHITECTURE

Do not scatter mock data throughout the application.

Centralize mock data for:

Products

Variants

Collections

Categories

Coupons

Users

Roles

Permissions

Addresses

Orders

Payments

Shipments

Tracking events

Homepage content

Keep the UI components independent from the data source.

The mock layer should later be replaceable with real APIs/database calls.

53. SECURITY-READY STRUCTURE

Never expose:

Razorpay secret keys

Delhivery API keys

Database credentials

Private API tokens

Payment verification must eventually happen server-side.

Shipping API requests must eventually happen server-side.

RBAC must eventually be enforced server-side.

Frontend permission checks are for UX, not the final security boundary.

54. SEO

Prepare storefront pages for SEO.

Use:

Semantic HTML

Proper headings

Metadata

Product metadata

Collection metadata

Clean URLs

Open Graph-ready structure

55. ACCESSIBILITY

Implement:

Keyboard navigation

Focus states

Proper labels

Accessible modals

Accessible drawers

Accessible dropdowns

Accessible form errors

Alt text

Good contrast

Reduced motion support

Do not rely solely on color to communicate availability or status.

56. PERFORMANCE

Avoid unnecessary heavy effects.

Optimize:

Images

Product grids

Animations

Components

Client-side state

Use Next.js image optimization where appropriate.

Lazy-load content where appropriate.

57. DO NOT BUILD THESE FEATURES

This project does NOT require:

Analytics dashboard

Inventory quantities

Warehouse management

Multi-vendor functionality

Loyalty points

Subscription products

AI recommendations

Complex CRM

Advanced marketing automation

Complex page builder

Unnecessary admin roles

Unnecessary enterprise features

Keep the project focused.

58. IMPORTANT BUSINESS RULE

Inventory is NOT being implemented at this stage.

Only variant availability is required.

For example:

S — Available

M — Unavailable

L — Available

No stock quantities.

No warehouse counts.

No "only 2 left" messaging.

The architecture should remain extensible for future inventory management.

59. IMPORTANT UX RULE

The website should never feel like a collection of disconnected pages.

All flows must connect.

Example:

Guest:

Product → Add to Cart → Login → Register → Return to Product → Cart → Checkout

Customer:

Login → Wishlist → Cart → Checkout → Razorpay/COD → Order → Confirmation → Account → Tracking

Admin:

Login → Role verification → Admin Dashboard → Product/Collection/Coupon/Order management

60. FINAL VISUAL QUALITY STANDARD

The finished frontend should be portfolio-quality.

A viewer should immediately think:

"This is a real luxury ecommerce platform."

not:

"This is an AI-generated website template."

Prioritize:

Typography

Spacing

Image composition

Product presentation

Responsive behavior

Interaction quality

Consistency

Elegant animations

Empty/loading/error states

Authentication UX

Admin UX

RBAC UX

Every page should feel intentionally designed.

61. FINAL IMPLEMENTATION RULE

Do not build only static screens.

Every major interaction must have a defined UI flow.

Buttons should do something meaningful.

Forms should have:

Validation

Loading

Success

Error

Actions should have:

Confirmation where appropriate

Feedback

Error handling

Do not create fake functionality that visually claims an external integration is working when it is not connected.

Use realistic mock data and clearly separated integration points.

62. FINAL ACCEPTANCE CHECKLIST

Before considering the frontend complete, verify:

Homepage

Navbar

Mobile navigation

Footer

Editorial image sections

Product listing

Product filtering

Product sorting

Search

Collections

Product detail

Product gallery

Variant availability

Wishlist authentication prompt

Cart authentication prompt

Login

Register

Forgot password

Reset password

Wishlist

Cart drawer

Cart page

Coupon system

First visitor popup

Checkout

COD

Razorpay-ready UI

Payment states

Order success

Order failure

Customer dashboard

Orders

Order details

Shipping timeline

Delhivery-ready structure

Returns/refunds UI

Transactional email-ready structure

Admin dashboard

Admin products

Admin collections

Admin coupons

Admin orders

Admin payments

Admin shipping

Admin customers

Admin content

Admin settings

RBAC

Permission-based route protection

Responsive mobile/tablet/desktop layouts

Loading states

Empty states

Error states

Toasts

Accessible interactions

SEO-ready structure

Tailwind-only styling

No CSS files

No CSS modules

No styled-components

No <style> tags

No style={{}}

No exposed secrets

MOST IMPORTANT PRIORITY

Do not sacrifice visual quality for feature quantity.

This is a premium fashion ecommerce experience.

The hierarchy of priorities should be:

Luxury visual identity

Product presentation

Responsive UX

Complete shopping flow

Authentication

Admin configurability

RBAC

Payment/order/shipping states

Polished edge cases

Integration-ready architecture

Build something that looks expensive, feels intentional, and can realistically be connected to a backend later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/725faea8-652a-4a3f-af3e-20dbf56c1b85).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
