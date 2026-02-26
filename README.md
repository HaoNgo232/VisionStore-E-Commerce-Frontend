<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="80" alt="VisionStore Logo" />
</p>

<h1 align="center">VisionStore - E-Commerce Frontend</h1>

<p align="center">
  The storefront and admin dashboard for the E-Commerce Microservices Platform, built with <strong>Next.js 16</strong>, <strong>React 19</strong>, <strong>TanStack Query</strong>, and <strong>Zustand</strong>.
</p>

<p align="center">
  Part of the <strong>E-Commerce Microservices Platform</strong>. See also: <a href="https://github.com/HaoNgo232/Microservices-E-commerce-backend">Backend Repository</a>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn/ui-New_York-000000?logo=shadcnui&logoColor=white" alt="shadcn/ui" /></a>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages & Routes](#pages--routes)
- [Feature Modules](#feature-modules)
- [State Management](#state-management)
- [API Client](#api-client)
- [Configuration](#configuration)
- [Testing](#testing)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Project Overview

This is the frontend application for an e-commerce platform specializing in eyewear. It serves two audiences:

- **Customers** -- Browse products, manage shopping cart, place orders, process payments, and use the AR virtual try-on feature to preview eyewear.
- **Administrators** -- Manage products, categories, orders, users, and view dashboard analytics.

The frontend communicates with the [backend microservices](../Microservices-E-commerce-backend) through the API Gateway at a single base URL.

---

## Architecture

### Application Layers

```
                            ┌──────────────────────────┐
                            │       Next.js App        │
                            │    (app/ directory)      │
                            │  Pages, Layouts, Routes  │
                            └─────────┬────────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
      ┌────────▼────────┐   ┌──────── ▼────────┐   ┌─────────▼───────┐
      │   Components    │   │   Feature Modules│   │   Shared Hooks  │
      │  (components/)  │   │   (features/)    │   │   (hooks/)      │
      │  Layout, UI,    │   │  Products, Cart, │   │  useDebounce,   │
      │  Sections       │   │  Orders, Auth,   │   │  useMobile,     │
      │                 │   │  AR, Payments    │   │  useAsync       │
      └────────┬────────┘   └─────────┬────────┘   └─────────────────┘
               │                      │
               └──────────┬───────────┘
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
┌─────▼──────┐     ┌──────▼──────┐    ┌───────▼──────┐
│  Zustand   │     │  TanStack   │    │  API Client  │
│  Stores    │     │  React Query│    │  (lib/)      │
│ Auth, Cart │     │  Server     │    │  Axios +     │
│            │     │  State      │    │  Interceptors│
└────────────┘     └─────────────┘    └──────┬───────┘
                                             │ HTTPS
                                    ┌────────▼────────┐
                                    │  Backend API    │
                                    │  Gateway :3000  │
                                    └─────────────────┘
```

### Design Principles

- **Feature-based organization** -- Each domain (products, cart, orders, etc.) is a self-contained module under `features/` with its own components, hooks, services, and types.
- **Layered state management** -- Zustand for client state (auth tokens, cart), TanStack Query for server state (products list, order details).
- **Type safety** -- Strict TypeScript configuration with branded types, discriminated unions, and runtime type guards.
- **Service layer** -- All API interactions go through typed service functions, never called directly from components.

---

## Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Framework** | Next.js 16 (App Router) | SSR, routing, layouts |
| **Library** | React 19 | UI rendering |
| **Language** | TypeScript 5.9 | Type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **UI Components** | shadcn/ui (New York) | Accessible, composable components via Radix UI |
| **Server State** | TanStack React Query 5 | Caching, background refresh, pagination |
| **Client State** | Zustand 5 | Auth tokens, cart, with localStorage persistence |
| **Forms** | React Hook Form 7 + Zod | Validation and form state |
| **HTTP Client** | Axios | Request/response interceptors, token refresh |
| **Charts** | Recharts | Admin dashboard analytics |
| **AR / Try-on** | face-api.js | Face detection for virtual eyewear try-on |
| **Table** | TanStack Table 8 | Admin data tables |
| **Icons** | Lucide React | Icon library |
| **Carousel** | Embla Carousel | Product image sliders |
| **Toast** | Sonner | Notification toasts |
| **Theming** | next-themes | Dark / light mode |
| **Testing** | Jest 30 + Testing Library | Unit tests |
| **Testing (E2E)** | Playwright | End-to-end tests |
| **Linting** | ESLint 9 (flat config) | Code quality |
| **Package Manager** | pnpm | Dependency management |

---

## Project Structure

```
Microservices-E-commerce-frontend
├── app/                          # Next.js App Router
│   ├── layout.tsx                   # Root layout (fonts, providers, toaster)
│   ├── providers.tsx                # QueryClientProvider setup
│   ├── globals.css                  # Global styles + Tailwind
│   ├── page.tsx                     # Root redirect
│   ├── (shop)/                      # Public storefront (Header + Footer)
│   │   ├── products/                # Product listing and detail pages
│   │   ├── cart/                    # Shopping cart page
│   │   ├── about/                   # About page
│   │   └── contact/                 # Contact page
│   ├── (account)/                   # Authenticated user area
│   │   ├── login/                   # Login page
│   │   ├── register/                # Registration page
│   │   ├── profile/                 # User profile and settings
│   │   ├── orders/                  # Order history
│   │   └── try-on/                  # AR virtual try-on page
│   ├── admin/                       # Admin dashboard (RBAC-protected)
│   │   ├── page.tsx                 # Dashboard overview
│   │   ├── products/                # Product CRUD
│   │   ├── orders/                  # Order management
│   │   └── users/                   # User management
│   ├── auth/                        # Auth flow pages
│   └── unauthorized/                # 403 page
│
├── features/                     # Feature modules (domain-driven)
│   ├── products/                    # Product domain
│   │   ├── components/              # ProductCard, ProductFilters, etc.
│   │   ├── hooks/                   # useProducts, useProductDetail
│   │   ├── services/                # productApi service layer
│   │   ├── schemas/                 # Zod validation schemas
│   │   ├── types/                   # Product-specific types
│   │   └── utils/                   # Price formatting, slug utils
│   ├── cart/                        # Cart domain
│   ├── orders/                      # Order domain
│   ├── checkout/                    # Checkout flow
│   ├── payments/                    # Payment processing (COD, SePay QR)
│   ├── auth/                        # Authentication logic
│   ├── addresses/                   # Address management
│   ├── users/                       # User management (admin)
│   ├── categories/                  # Category browsing
│   └── ar/                          # AR virtual try-on (face-api.js)
│
├── components/                   # Shared components
│   ├── layout/                      # Header, Footer, AdminSidebar
│   ├── sections/                    # Landing page sections
│   ├── skeletons/                   # Loading skeleton states
│   ├── auth/                        # ProtectedRoute component
│   ├── ui/                          # shadcn/ui primitives (33 components)
│   ├── command-menu.tsx             # Cmd+K search
│   └── theme-provider.tsx           # Dark/light mode
│
├── stores/                       # Zustand global stores
│   ├── auth.store.ts                # JWT tokens + role extraction
│   └── cart.store.ts                # Cart state + API sync
│
├── lib/                          # Core utilities
│   ├── api-client.ts                # Axios instance + interceptors + helpers
│   ├── query-keys.ts                # TanStack Query key factory
│   ├── auth-utils.ts                # Auth helper functions
│   ├── validation-utils.ts          # Shared validation logic
│   ├── utils.ts                     # cn() class merge utility
│   └── validations/                 # Global Zod schemas
│
├── types/                        # Shared TypeScript types
│   ├── index.ts                     # Re-exports
│   ├── common.types.ts              # Pagination, API response wrappers
│   ├── product.types.ts             # Product, Category interfaces
│   ├── cart.types.ts                # Cart, CartItem interfaces
│   ├── order.types.ts               # Order, OrderItem, OrderStatus
│   ├── payment.types.ts             # Payment, PaymentMethod, QR data
│   ├── auth.types.ts                # Login, Register, UserRole enum
│   ├── user.types.ts                # User profile
│   ├── address.types.ts             # Address model
│   ├── ar.types.ts                  # AR snapshot types
│   ├── category.types.ts            # Category tree
│   └── utils.ts                     # Branded types, type guards
│
├── hooks/                        # Shared custom hooks
│   ├── use-debounce.ts              # Debounced values
│   ├── use-mobile.ts                # Responsive breakpoint
│   └── use-async.ts                 # Async operation wrapper
│
├── config/                       # App configuration
├── public/                       # Static assets (images, fonts, models)
├── e2e/                          # Playwright test specs
├── scripts/                      # Build and utility scripts
│
├── next.config.mjs                  # Next.js configuration
├── eslint.config.mjs                # ESLint flat config (strict TypeScript)
├── jest.config.js                   # Jest configuration
├── playwright.config.ts             # Playwright E2E configuration
├── components.json                  # shadcn/ui configuration
├── tsconfig.json                    # TypeScript (strict mode)
└── package.json                     # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|:-----|:--------|
| **Node.js** | v20+ |
| **pnpm** | v10+ |
| **Backend API** | Running at `http://localhost:3000` (see [backend repo](../Microservices-E-commerce-backend)) |

### Installation

```bash
git clone https://github.com/HaoNgo232/Microservices-E-commerce-frontend.git
cd Microservices-E-commerce-frontend
pnpm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` to point to your backend API:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Start Development Server

```bash
pnpm dev
```

The app runs on **http://localhost:3001** (port 3001 to avoid conflict with the backend gateway on port 3000).

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Pages & Routes

### Public (Storefront)

| Route | Description |
|:------|:------------|
| `/` | Home page redirect |
| `/home` | Landing page with hero, featured products |
| `/products` | Product listing with filters and pagination |
| `/products/[slug]` | Product detail with images, description, add-to-cart |
| `/cart` | Shopping cart with quantity management |
| `/about` | About page |
| `/contact` | Contact page |

### Authenticated (Customer)

| Route | Description |
|:------|:------------|
| `/login`, `/register` | Auth flow |
| `/profile` | User profile and settings |
| `/orders` | Order history |
| `/try-on` | AR virtual try-on (face-api.js) |

### Admin Dashboard (RBAC-protected)

| Route | Description |
|:------|:------------|
| `/admin` | Dashboard with analytics |
| `/admin/products` | Product CRUD with image upload |
| `/admin/products/new` | Create product form |
| `/admin/products/[id]/edit` | Edit product form |
| `/admin/orders` | Order management and status updates |
| `/admin/users` | User listing and administration |

---

## Feature Modules

Each feature under `features/` follows a consistent internal structure:

```
features/<domain>/
├── components/      # UI components scoped to this feature
├── hooks/           # React Query hooks (useProducts, useOrders, etc.)
├── services/        # API service functions (typed request/response)
├── schemas/         # Zod schemas for form validation
├── types/           # Feature-specific TypeScript types
└── utils/           # Helper functions
```

### Key Features

| Module | Description |
|:-------|:------------|
| `products` | Product listing, filtering, detail views, admin CRUD, image upload |
| `cart` | Add/update/remove items, clear cart, guest-to-user merge |
| `orders` | Order creation, history, detail view, status tracking, admin management |
| `checkout` | Multi-step checkout flow with address selection and payment |
| `payments` | COD and SePay bank transfer, QR code generation, payment status polling |
| `auth` | Login, register, token refresh, logout, protected route component |
| `addresses` | Address CRUD, default address selection |
| `users` | Admin user management (list, detail, status toggle) |
| `categories` | Category tree rendering and product filtering |
| `ar` | AR virtual try-on using face-api.js for face detection and glasses overlay |

---

## State Management

### Zustand Stores (Client State)

**`auth.store.ts`** -- Manages JWT tokens with localStorage persistence. Decodes the token payload to extract `userId` and `role` without an additional API call. User profile data is fetched separately via React Query.

**`cart.store.ts`** -- Manages the shopping cart by syncing local state with the backend cart API. Provides actions for `addItem`, `updateItem`, `removeItem`, `clearCart`, and derived values like `getItemCount` and `getTotal`.

### TanStack React Query (Server State)

Server-side data (products, orders, users, etc.) is managed through React Query with:

- Centralized query key factory in `lib/query-keys.ts`
- 1-minute stale time by default
- Automatic retry (up to 3 times, skipping 4xx errors)
- React Query Devtools enabled in development

---

## API Client

The API client (`lib/api-client.ts`) is an Axios instance configured with:

- **Base URL** from `NEXT_PUBLIC_API_URL` environment variable
- **Request interceptor** that attaches the JWT `Authorization: Bearer` header
- **Response interceptor** that handles 401 errors by attempting a token refresh and retrying the original request; on failure, clears tokens and redirects to `/login`
- **Typed helper functions**: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`
- **Zod-validated variants**: `apiGetValidated`, `apiPostValidated`, etc., which parse the response against a Zod schema before returning

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend API Gateway URL |

### TypeScript

The `tsconfig.json` enables strict mode with additional checks:

- `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`, `noImplicitReturns`
- `noUnusedLocals`, `noUnusedParameters`
- Path alias: `@/*` maps to the project root

### ESLint

ESLint uses flat config (`eslint.config.mjs`) with type-aware linting:

- `typescript-eslint` recommendedTypeChecked + stylisticTypeChecked
- `@tanstack/eslint-plugin-query` for React Query best practices
- `react-hooks/exhaustive-deps` set to error
- `no-explicit-any` set to error
- `consistent-type-imports` enforced

### shadcn/ui

Configured in `components.json`:
- Style: `new-york`
- Base color: `neutral`
- CSS variables enabled
- Icon library: `lucide`
- 33 UI primitives installed under `components/ui/`

---

## Testing

### Unit Tests (Jest)

```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode
```

Configuration:
- Test environment: `jest-environment-jsdom`
- Path alias support: `@/*` mapped to project root
- E2E folder excluded from Jest

### E2E Tests (Playwright)

```bash
pnpm test:e2e          # Run E2E tests
pnpm test:e2e:ui       # Interactive UI mode
pnpm test:e2e:debug    # Debug mode
```

Configuration:
- Test directory: `e2e/`
- Base URL: `http://localhost:3001`
- Browser: Chromium
- Auto-starts dev server before tests
- Screenshots on failure, traces on first retry

---

## Development Guidelines

### Code Organization

- Place feature-specific code under `features/<domain>/`.
- Shared code goes under `components/`, `hooks/`, `lib/`, or `types/`.
- Do not import from one feature module into another. Shared logic should be lifted to `lib/` or `types/`.

### Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `product-card.tsx`)
- **Components**: `PascalCase` (e.g., `ProductCard`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useProducts`)
- **Services**: `camelCase` with `Api` suffix (e.g., `productApi`)
- **Types**: `PascalCase` (e.g., `ProductFilters`)

### Adding a New Feature

1. Create a directory under `features/<name>/`
2. Add `components/`, `hooks/`, `services/`, and `types/` subdirectories as needed
3. Define types in `types/<name>.types.ts` and re-export from `types/index.ts`
4. Add query keys to `lib/query-keys.ts`
5. Create service functions using the typed `apiGet`/`apiPost` helpers
6. Build React Query hooks in the feature's `hooks/` directory
7. Create the page under `app/` and wire up the components

### Linting

```bash
pnpm lint              # Run ESLint
```

---

## Troubleshooting

### API Connection Errors

Verify the backend gateway is running on the URL specified in `NEXT_PUBLIC_API_URL`:

```bash
curl http://localhost:3000/health
```

If the backend uses a different port or host, update `.env` accordingly and restart the dev server.

### Authentication Issues

| Symptom | Cause | Fix |
|:--------|:------|:----|
| Redirected to `/login` on every request | Token expired or missing | Log in again; check that `auth-store` key exists in localStorage |
| 401 loop / infinite redirect | Token refresh failing | Clear localStorage (`auth-store` key) and log in again |
| Admin pages show "Unauthorized" | User role is not `ADMIN` | Log in with an admin account |

### Hydration Mismatch Warnings

The root layout includes `suppressHydrationWarning` on the `<body>` tag because `next-themes` modifies class attributes on the client. This is expected behavior.

### Port Conflicts

The dev server runs on port 3001 by default. If that port is taken:

```bash
pnpm dev -- -p 3002
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Follow the naming conventions and code organization rules above
4. Write unit tests for new hooks and utilities
5. Run lint checks before pushing:
   ```bash
   pnpm lint
   pnpm test
   ```
6. Submit a Pull Request

---

## Related Repositories

This frontend is one half of the **E-Commerce Microservices Platform**. Both repositories are required for a working system.

| Repository | Stack | Description |
|:-----------|:------|:------------|
| [Microservices-E-commerce-backend](https://github.com/HaoNgo232/Microservices-E-commerce-backend) | NestJS, NATS, Prisma, PostgreSQL | API Gateway + 7 microservices (User, Product, Cart, Order, Payment, AR, Report) |
| **This repo** (frontend) | Next.js, React, TanStack Query, Zustand | Storefront, customer dashboard, admin panel |

<p align="center">
  Built with <a href="https://nextjs.org/">Next.js</a> &bull; <a href="https://react.dev/">React</a> &bull; <a href="https://tailwindcss.com/">Tailwind CSS</a> &bull; <a href="https://ui.shadcn.com/">shadcn/ui</a>
</p>
