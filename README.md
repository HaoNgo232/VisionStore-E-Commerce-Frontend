# Eyewear store website

_Automatically synced with your [v0.app](https://v0.app) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/haos-projects-6c60ac50/v0-eyewear-store-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/vdPYRC3vr3S)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Project Structure

```
frontend-luan-van/
├── app/                      # Next.js app directory
│   ├── (account)/           # Account related pages
│   ├── (shop)/              # Shop related pages
│   └── layout.tsx
├── components/              # Shared components
│   ├── layout/             # Layout components (header, footer)
│   ├── sections/           # Page sections
│   ├── skeletons/          # Loading skeletons
│   └── ui/                 # UI components (shadcn/ui)
├── features/               # Feature-based modules
│   ├── products/
│   │   ├── components/     # Product components
│   │   ├── hooks/          # Product hooks
│   │   ├── types/          # Product-specific types
│   │   └── utils/          # Product utilities
│   ├── cart/
│   ├── orders/
│   ├── addresses/
│   └── virtual-tryon/
├── services/               # Service layer (business logic)
│   ├── product.service.ts
│   ├── order.service.ts
│   └── address.service.ts
├── stores/                 # Zustand stores
│   ├── cart.store.ts
│   ├── ui.store.ts
│   └── user.store.ts
├── hooks/                  # Shared hooks
├── lib/                    # Utilities and helpers
│   ├── validations/        # Zod schemas
│   ├── api-client.ts       # API client
│   └── utils.ts
├── types/                  # TypeScript types
│   ├── index.ts            # Main types
│   ├── api.ts              # API types
│   └── utils.ts            # Utility types
└── public/                 # Static assets
```

## Architecture Principles

### 1. Feature-based Organization

Each feature has its own folder with:

- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `types/` - Feature-specific types
- `utils/` - Feature-specific utilities

### 2. Service Layer

Business logic is separated into service classes:

- API calls and data transformation
- Business rules and calculations
- Reusable across multiple components

### 3. State Management

- **Zustand** for global state (cart, user, UI)
- **React hooks** for local component state
- **React Query** (future) for server state

### 4. Type Safety

- Branded types for IDs
- Discriminated unions for API responses
- Type guards for runtime checks
- Utility types for common patterns

## Project Structure

```
frontend-luan-van/
├── app/                      # Next.js app directory
│   ├── (account)/           # Account related pages
│   ├── (shop)/              # Shop related pages
│   └── layout.tsx
├── components/              # Shared components
│   ├── layout/             # Layout components (header, footer)
│   ├── sections/           # Page sections
│   ├── skeletons/          # Loading skeletons
│   └── ui/                 # UI components (shadcn/ui)
├── features/               # Feature-based modules
│   ├── products/
│   │   ├── components/     # Product components
│   │   ├── hooks/          # Product hooks
│   │   ├── types/          # Product-specific types
│   │   └── utils/          # Product utilities
│   ├── cart/
│   ├── orders/
│   ├── addresses/
│   └── virtual-tryon/
├── services/               # Service layer (business logic)
│   ├── product.service.ts
│   ├── order.service.ts
│   └── address.service.ts
├── stores/                 # Zustand stores
│   ├── cart.store.ts
│   ├── ui.store.ts
│   └── user.store.ts
├── hooks/                  # Shared hooks
├── lib/                    # Utilities and helpers
│   ├── validations/        # Zod schemas
│   ├── api-client.ts       # API client
│   └── utils.ts
├── types/                  # TypeScript types
│   ├── index.ts            # Main types
│   ├── api.ts              # API types
│   └── utils.ts            # Utility types
└── public/                 # Static assets
```

## Architecture Principles

### 1. Feature-based Organization

Each feature has its own folder with:

- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `types/` - Feature-specific types
- `utils/` - Feature-specific utilities

### 2. Service Layer

Business logic is separated into service classes:

- API calls and data transformation
- Business rules and calculations
- Reusable across multiple components

### 3. State Management

- **Zustand** for global state (cart, user, UI)
- **React hooks** for local component state
- **React Query** (future) for server state

### 4. Type Safety

- Branded types for IDs
- Discriminated unions for API responses
- Type guards for runtime checks
- Utility types for common patterns

## Project Structure

```
frontend-luan-van/
├── app/                      # Next.js app directory
│   ├── (account)/           # Account related pages
│   ├── (shop)/              # Shop related pages
│   └── layout.tsx
├── components/              # Shared components
│   ├── layout/             # Layout components (header, footer)
│   ├── sections/           # Page sections
│   ├── skeletons/          # Loading skeletons
│   └── ui/                 # UI components (shadcn/ui)
├── features/               # Feature-based modules
│   ├── products/
│   │   ├── components/     # Product components
│   │   ├── hooks/          # Product hooks
│   │   ├── types/          # Product-specific types
│   │   └── utils/          # Product utilities
│   ├── cart/
│   ├── orders/
│   ├── addresses/
│   └── virtual-tryon/
├── services/               # Service layer (business logic)
│   ├── product.service.ts
│   ├── order.service.ts
│   └── address.service.ts
├── stores/                 # Zustand stores
│   ├── cart.store.ts
│   ├── ui.store.ts
│   └── user.store.ts
├── hooks/                  # Shared hooks
├── lib/                    # Utilities and helpers
│   ├── validations/        # Zod schemas
│   ├── api-client.ts       # API client
│   └── utils.ts
├── types/                  # TypeScript types
│   ├── index.ts            # Main types
│   ├── api.ts              # API types
│   └── utils.ts            # Utility types
└── public/                 # Static assets
```

## Architecture Principles

### 1. Feature-based Organization

Each feature has its own folder with:

- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `types/` - Feature-specific types
- `utils/` - Feature-specific utilities

### 2. Service Layer

Business logic is separated into service classes:

- API calls and data transformation
- Business rules and calculations
- Reusable across multiple components

### 3. State Management

- **Zustand** for global state (cart, user, UI)
- **React hooks** for local component state
- **React Query** (future) for server state

### 4. Type Safety

- Branded types for IDs
- Discriminated unions for API responses
- Type guards for runtime checks
- Utility types for common patterns

## Project Structure

```
frontend-luan-van/
├── app/                      # Next.js app directory
│   ├── (account)/           # Account related pages
│   ├── (shop)/              # Shop related pages
│   └── layout.tsx
├── components/              # Shared components
│   ├── layout/             # Layout components (header, footer)
│   ├── sections/           # Page sections
│   ├── skeletons/          # Loading skeletons
│   └── ui/                 # UI components (shadcn/ui)
├── features/               # Feature-based modules
│   ├── products/
│   │   ├── components/     # Product components
│   │   ├── hooks/          # Product hooks
│   │   ├── types/          # Product-specific types
│   │   └── utils/          # Product utilities
│   ├── cart/
│   ├── orders/
│   ├── addresses/
│   └── virtual-tryon/
├── services/               # Service layer (business logic)
│   ├── product.service.ts
│   ├── order.service.ts
│   └── address.service.ts
├── stores/                 # Zustand stores
│   ├── cart.store.ts
│   ├── ui.store.ts
│   └── user.store.ts
├── hooks/                  # Shared hooks
├── lib/                    # Utilities and helpers
│   ├── validations/        # Zod schemas
│   ├── api-client.ts       # API client
│   └── utils.ts
├── types/                  # TypeScript types
│   ├── index.ts            # Main types
│   ├── api.ts              # API types
│   └── utils.ts            # Utility types
└── public/                 # Static assets
```

## Architecture Principles

### 1. Feature-based Organization

Each feature has its own folder with:

- `components/` - Feature-specific components
- `hooks/` - Feature-specific hooks
- `types/` - Feature-specific types
- `utils/` - Feature-specific utilities

### 2. Service Layer

Business logic is separated into service classes:

- API calls and data transformation
- Business rules and calculations
- Reusable across multiple components

### 3. State Management

- **Zustand** for global state (cart, user, UI)
- **React hooks** for local component state
- **React Query** (future) for server state

### 4. Type Safety

- Branded types for IDs
- Discriminated unions for API responses
- Type guards for runtime checks
- Utility types for common patterns

## Deployment

Your project is live at:

**[https://vercel.com/haos-projects-6c60ac50/v0-eyewear-store-website](https://vercel.com/haos-projects-6c60ac50/v0-eyewear-store-website)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/vdPYRC3vr3S](https://v0.app/chat/projects/vdPYRC3vr3S)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
