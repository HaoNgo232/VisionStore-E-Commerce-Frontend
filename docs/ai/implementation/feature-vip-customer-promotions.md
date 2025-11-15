---
phase: implementation
title: VIP Customer Management & Promotions - Frontend Implementation
description: Component implementation, state management, và integration patterns
---

# Implementation Guide - Frontend

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Backend API running (`http://localhost:3000`)

### Environment Setup

```bash
# Clone and install
cd frontend-luan-van
pnpm install

# Setup environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

### Configuration Files

**`.env.local`**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Code Structure

```
frontend-luan-van/
├── app/
│   ├── (account)/
│   │   └── profile/
│   │       └── page.tsx                 # Profile page with VIP status
│   ├── (shop)/
│   │   └── checkout/
│   │       └── page.tsx                 # Checkout with discount input
│   └── admin/
│       ├── promotions/
│       │   └── page.tsx                 # Admin discount code manager
│       └── customers/
│           └── page.tsx                 # Admin VIP tier manager
├── components/
│   └── promotions/
│       └── vip-badge.tsx                # Shared VIP badge component
├── features/
│   └── promotions/
│       ├── components/
│       │   ├── vip-status-card.tsx
│       │   ├── discount-code-input.tsx
│       │   ├── discount-code-table.tsx
│       │   ├── discount-code-form-dialog.tsx
│       │   └── vip-tier-update-modal.tsx
│       ├── hooks/
│       │   └── use-promotions.ts        # React Query hooks
│       └── utils/
│           ├── vip-helpers.ts           # Helper functions
│           └── discount-formatters.ts   # Formatting utilities
├── services/
│   └── promotions.service.ts            # API client
├── types/
│   └── promotion.types.ts               # TypeScript types + Zod schemas
└── lib/
    ├── api-client.ts                    # Base API client
    └── query-keys.ts                    # Query key factories
```

## Implementation Notes

### Core Features

#### 1. VIPBadge Component (Shared)

**File**: `components/promotions/vip-badge.tsx`

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VipTier } from "@/types/promotion.types";

interface VIPBadgeProps {
  tier: VipTier;
  className?: string;
  showLabel?: boolean;
}

const tierConfig: Record<
  VipTier,
  { icon: string; label: string; className: string }
> = {
  [VipTier.STANDARD]: { icon: "", label: "", className: "" },
  [VipTier.BRONZE]: {
    icon: "🥉",
    label: "Bronze",
    className: "bg-amber-700 text-white hover:bg-amber-800",
  },
  [VipTier.SILVER]: {
    icon: "🥈",
    label: "Silver",
    className: "bg-gray-400 text-black hover:bg-gray-500",
  },
  [VipTier.GOLD]: {
    icon: "🥇",
    label: "Gold",
    className: "bg-yellow-400 text-black hover:bg-yellow-500",
  },
  [VipTier.PLATINUM]: {
    icon: "💎",
    label: "Platinum",
    className: "bg-purple-500 text-white hover:bg-purple-600",
  },
};

export function VIPBadge({ tier, className, showLabel = true }: VIPBadgeProps) {
  if (tier === VipTier.STANDARD) return null;

  const config = tierConfig[tier];

  return (
    <Badge
      className={cn(config.className, className)}
      aria-label={`VIP ${config.label}`}
    >
      <span className="mr-1" aria-hidden="true">
        {config.icon}
      </span>
      {showLabel && config.label}
    </Badge>
  );
}
```

#### 2. VIPStatusCard Component

**File**: `features/promotions/components/vip-status-card.tsx`

```tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VIPBadge } from "@/components/promotions/vip-badge";
import { useMyVipInfo } from "../hooks/use-promotions";
import { formatVND } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function VIPStatusCard() {
  const { data: vipInfo, isLoading, error } = useMyVipInfo();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>VIP Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>VIP Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load VIP status. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!vipInfo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          VIP Status
          <VIPBadge tier={vipInfo.currentTier} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Spending */}
        <div>
          <p className="text-sm text-muted-foreground">Total Spending</p>
          <p className="text-2xl font-bold">
            {formatVND(vipInfo.totalSpentInt)}
          </p>
        </div>

        {/* Discount Rate */}
        <div>
          <p className="text-sm text-muted-foreground">Your Discount Rate</p>
          <p className="text-xl font-semibold text-green-600">
            {(vipInfo.discountRate * 100).toFixed(0)}%
          </p>
        </div>

        {/* Next Tier Progress */}
        {vipInfo.nextTier && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Next Tier</p>
              <VIPBadge tier={vipInfo.nextTier.tier} />
            </div>
            <p className="text-sm">
              Spend{" "}
              <span className="font-semibold">
                {formatVND(vipInfo.nextTier.remaining)}
              </span>{" "}
              more to unlock
            </p>
            {/* Optional: Progress bar */}
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                style={{
                  width: `${
                    (vipInfo.totalSpentInt /
                      vipInfo.nextTier.requiredSpending) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### 3. DiscountCodeInput Component

**File**: `features/promotions/components/discount-code-input.tsx`

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useValidateDiscountCode } from "../hooks/use-promotions";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DiscountCodeInputProps {
  subtotalInt: number;
  onApplied: (code: string, discountedInt: number) => void;
  appliedCode?: string | null;
  onRemove: () => void;
  className?: string;
}

const ERROR_MESSAGES = {
  CODE_EXPIRED: "This code has expired",
  TIER_NOT_MET: "Your VIP tier is not eligible for this code",
  MAX_USAGE_REACHED: "This code has reached its usage limit",
  MIN_PURCHASE_NOT_MET: "Minimum purchase amount not met",
  CODE_NOT_FOUND: "Invalid discount code",
  CODE_INACTIVE: "This code is not active",
  USER_MAX_USAGE_REACHED: "You have already used this code",
} as const;

export function DiscountCodeInput({
  subtotalInt,
  onApplied,
  appliedCode,
  onRemove,
  className,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");
  const validateMutation = useValidateDiscountCode();

  const handleApply = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      toast.error("Please enter a discount code");
      return;
    }

    try {
      const result = await validateMutation.mutateAsync({
        code: trimmedCode.toUpperCase(),
        subtotalInt,
      });

      if (result.valid && result.discountedInt !== null) {
        onApplied(trimmedCode.toUpperCase(), result.discountedInt);
        toast.success(
          `Discount applied: ${formatVND(result.discountedInt)} off`,
          {
            icon: <CheckCircle className="h-4 w-4" />,
          },
        );
        setCode("");
      } else if (result.error) {
        const errorMessage =
          ERROR_MESSAGES[result.error] || "Invalid discount code";
        toast.error(errorMessage, {
          icon: <XCircle className="h-4 w-4" />,
        });
      }
    } catch (error) {
      toast.error("Failed to validate discount code. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  if (appliedCode) {
    return (
      <div
        className={cn(
          "flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <p className="text-sm font-medium">
            Code <span className="font-mono font-bold">{appliedCode}</span>{" "}
            applied
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        placeholder="Enter discount code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyPress={handleKeyPress}
        disabled={validateMutation.isPending}
        className="uppercase font-mono"
        aria-label="Discount code"
      />
      <Button
        onClick={handleApply}
        disabled={validateMutation.isPending || !code.trim()}
        className="min-w-[100px]"
      >
        {validateMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Apply
      </Button>
    </div>
  );
}
```

#### 4. React Query Hooks

**File**: `features/promotions/hooks/use-promotions.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsApi } from "@/services/promotions.service";
import { toast } from "sonner";
import type {
  CreateDiscountCodeDto,
  UpdateVipTierDto,
  DiscountCode,
} from "@/types/promotion.types";

// Query Keys Factory
export const promotionKeys = {
  all: ["promotions"] as const,
  vipInfo: () => [...promotionKeys.all, "vip-info"] as const,
  codes: () => [...promotionKeys.all, "codes"] as const,
  codesList: (params?: ListCodesParams) =>
    [...promotionKeys.codes(), params || {}] as const,
};

// Hook: Get my VIP info
export function useMyVipInfo() {
  return useQuery({
    queryKey: promotionKeys.vipInfo(),
    queryFn: () => promotionsApi.getMyVipInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook: Validate discount code
export function useValidateDiscountCode() {
  return useMutation({
    mutationFn: ({
      code,
      subtotalInt,
    }: {
      code: string;
      subtotalInt: number;
    }) => promotionsApi.validateDiscountCode(code, subtotalInt),
  });
}

// Hook: List discount codes (Admin)
export function useDiscountCodes(params?: ListCodesParams) {
  return useQuery({
    queryKey: promotionKeys.codesList(params),
    queryFn: () => promotionsApi.listDiscountCodes(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook: Create discount code (Admin)
export function useCreateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDiscountCodeDto) =>
      promotionsApi.createDiscountCode(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.codes() });
      toast.success("Discount code created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create discount code: ${error.message}`);
    },
  });
}

// Hook: Update discount code (Admin)
export function useUpdateDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<DiscountCode>;
    }) => promotionsApi.updateDiscountCode(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.codes() });
      toast.success("Discount code updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update discount code: ${error.message}`);
    },
  });
}

// Hook: Delete discount code (Admin)
export function useDeleteDiscountCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsApi.deleteDiscountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.codes() });
      toast.success("Discount code deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete discount code: ${error.message}`);
    },
  });
}

// Hook: Update user VIP tier (Admin)
export function useUpdateVipTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: UpdateVipTierDto }) =>
      promotionsApi.updateUserVipTier(userId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("VIP tier updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update VIP tier: ${error.message}`);
    },
  });
}

// Helper type
interface ListCodesParams {
  page?: number;
  limit?: number;
  tier?: string | null;
  status?: "active" | "inactive" | "all";
  search?: string;
}
```

### Patterns & Best Practices

#### 1. Type-Safe API Client

```typescript
// services/promotions.service.ts

import { BaseApiService } from "@/lib/api-client";
import {
  VipInfoSchema,
  DiscountCodeSchema,
  DiscountValidationSchema,
  type VipInfo,
  type DiscountCode,
  type DiscountValidation,
  type CreateDiscountCodeDto,
  type UpdateVipTierDto,
} from "@/types/promotion.types";

class PromotionsApiService extends BaseApiService {
  async getMyVipInfo(): Promise<VipInfo> {
    const response = await this.get<VipInfo>("/users/me/vip");
    return VipInfoSchema.parse(response); // Validate with Zod
  }

  async validateDiscountCode(
    code: string,
    subtotalInt: number,
  ): Promise<DiscountValidation> {
    const response = await this.post<DiscountValidation>(
      "/promotions/codes/validate",
      {
        code: code.toUpperCase(),
        subtotalInt,
      },
    );
    return DiscountValidationSchema.parse(response);
  }

  async listDiscountCodes(
    params?: ListCodesParams,
  ): Promise<PaginatedResponse<DiscountCode>> {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) {
      searchParams.set("page", params.page.toString());
    }
    if (params?.limit !== undefined) {
      searchParams.set("limit", params.limit.toString());
    }
    if (params?.tier) {
      searchParams.set("tier", params.tier);
    }
    if (params?.status) {
      searchParams.set("status", params.status);
    }
    if (params?.search) {
      searchParams.set("search", params.search);
    }

    const endpoint = `/promotions/codes${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return this.get<PaginatedResponse<DiscountCode>>(endpoint);
  }

  // ... more methods
}

export const promotionsApi = new PromotionsApiService();
```

#### 2. Form Validation with Zod

```typescript
// features/promotions/components/discount-code-form-dialog.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateDiscountCodeSchema,
  type CreateDiscountCodeDto,
} from "@/types/promotion.types";

export function DiscountCodeFormDialog() {
  const form = useForm<CreateDiscountCodeDto>({
    resolver: zodResolver(CreateDiscountCodeSchema),
    defaultValues: {
      code: "",
      description: "",
      type: DiscountType.PERCENTAGE,
      value: 10,
      requiredTier: null,
      maxUsages: null,
      maxUsagePerUser: null,
      startsAt: null,
      expiresAt: null,
      minPurchaseInt: null,
    },
  });

  const onSubmit = async (data: CreateDiscountCodeDto) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
    </Form>
  );
}
```

#### 3. Accessibility Best Practices

```tsx
// Always include ARIA labels
<Badge aria-label={`VIP ${config.label}`}>
  {config.icon} {config.label}
</Badge>

// Keyboard navigation
<Input
  onKeyPress={(e) => {
    if (e.key === 'Enter') handleApply()
  }}
  aria-label="Discount code"
/>

// Loading states
<Button disabled={isLoading} aria-busy={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>

// Error announcements
<Alert role="alert" variant="destructive">
  <AlertDescription>{errorMessage}</AlertDescription>
</Alert>
```

#### 4. Responsive Design Patterns

```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <VIPStatusCard />
  <UserInfoCard />
</div>

// Responsive table (horizontal scroll on mobile)
<div className="overflow-x-auto">
  <Table className="min-w-[640px]">
    {/* Table content */}
  </Table>
</div>

// Responsive dialog
<Dialog>
  <DialogContent className="max-w-[95vw] md:max-w-[600px]">
    {/* Content */}
  </DialogContent>
</Dialog>
```

## Integration Points

### Profile Page Integration

```tsx
// app/(account)/profile/page.tsx

import { VIPStatusCard } from "@/features/promotions/components/vip-status-card";

export default function ProfilePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing components */}
        <UserInfoCard />
        <AddressesCard />

        {/* NEW: VIP Status */}
        <VIPStatusCard />
      </div>
    </div>
  );
}
```

### Checkout Page Integration

```tsx
// app/(shop)/checkout/page.tsx

import { DiscountCodeInput } from "@/features/promotions/components/discount-code-input";

export default function CheckoutPage() {
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleDiscountApplied = (code: string, discountedInt: number) => {
    setAppliedCode(code);
    setDiscountAmount(discountedInt);
  };

  const handleRemoveDiscount = () => {
    setAppliedCode(null);
    setDiscountAmount(0);
  };

  const finalTotal = subtotalInt + shippingCost - discountAmount;

  return (
    <div className="container py-8">
      {/* Cart items */}
      <CartSummary />

      {/* NEW: Discount Code Section */}
      <div className="mt-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Discount Code</h3>
        <DiscountCodeInput
          subtotalInt={subtotalInt}
          onApplied={handleDiscountApplied}
          appliedCode={appliedCode}
          onRemove={handleRemoveDiscount}
        />
      </div>

      {/* Order Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatVND(subtotalInt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatVND(shippingCost)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedCode})</span>
              <span>-{formatVND(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Total</span>
            <span>{formatVND(finalTotal)}</span>
          </div>
        </div>
      </div>

      <Button onClick={handlePlaceOrder} className="w-full mt-6">
        Place Order
      </Button>
    </div>
  );
}
```

## Error Handling

### API Error Handling

```typescript
// lib/api-client.ts

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class BaseApiService {
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Request failed: ${response.status}`,
          response.status,
          errorData,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Network error", 500);
    }
  }
}
```

## Performance Considerations

### 1. Lazy Loading Admin Components

```tsx
// app/admin/promotions/page.tsx

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DiscountCodeTable = dynamic(
  () =>
    import("@/features/promotions/components/discount-code-table").then(
      (mod) => ({ default: mod.DiscountCodeTable }),
    ),
  {
    loading: () => <Skeleton className="h-[400px]" />,
    ssr: false,
  },
);

export default function AdminPromotionsPage() {
  return (
    <div>
      <h1>Discount Codes</h1>
      <DiscountCodeTable />
    </div>
  );
}
```

### 2. React.memo for Expensive Components

```tsx
import { memo } from "react";

export const VIPBadge = memo(function VIPBadge({
  tier,
  className,
  showLabel,
}: VIPBadgeProps) {
  // Component logic
});
```

### 3. useMemo for Calculations

```tsx
export function VIPStatusCard() {
  const { data } = useMyVipInfo();

  const progressPercentage = useMemo(() => {
    if (!data?.nextTier) return 100;
    return (data.totalSpentInt / data.nextTier.requiredSpending) * 100;
  }, [data]);

  return <div style={{ width: `${progressPercentage}%` }} />;
}
```

## Security Notes

### 1. XSS Prevention

```tsx
// Always sanitize user input (React does this by default)
<p>{user.name}</p> //  Safe

// Never use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} /> //  Unsafe
```

### 2. Authorization Checks

```tsx
// Protect admin routes
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");
  if (!token && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}
```

### 3. Secure Token Storage

```typescript
// Use httpOnly cookies (set by backend)
// Never store tokens in localStorage

// If using localStorage (not recommended):
const token = localStorage.getItem("token"); //  Vulnerable to XSS
```

## Testing Strategy

See `docs/ai/testing/feature-vip-customer-promotions.md` for comprehensive testing guide.

**Quick Start**:

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```
