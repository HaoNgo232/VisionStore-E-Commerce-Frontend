---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
feature: payment-flow-separation
created: 2025-11-03
---

# Implementation Guide: Payment Flow Separation

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js v20+
- pnpm v8+
- Backend services running (Docker Compose)
- Frontend dev server: `pnpm dev`

### Environment Setup

```bash
# 1. Checkout feature branch
git checkout -b feature/payment-flow-separation

# 2. Install dependencies (if needed)
pnpm install

# 3. Verify backend is running
curl http://localhost:3000/api/health

# 4. Start frontend dev server
cd frontend-luan-van
pnpm dev

# 5. Open browser
http://localhost:3001
```

### Configuration

No new environment variables needed. Existing config:

- Backend API: `http://localhost:3000` (already configured in `lib/api-client.ts`)
- SePay BIDV: Virtual Account `96247HAOVA` (backend .env)

---

## Code Structure

**How is the code organized?**

### New Files Created

```
features/
├── orders/
│   └── components/
│       └── order-status-badge.tsx          # NEW
├── payments/
│   ├── components/
│   │   ├── payment-status-badge.tsx        # NEW
│   │   ├── payment-waiting-dialog.tsx      # NEW
│   │   └── payment-success-dialog.tsx      # NEW
│   └── hooks/
│       └── use-payment-polling.ts          # NEW
types/
├── order.types.ts                           # UPDATED (add enums)
└── payment.types.ts                         # UPDATED (add enums)

app/(shop)/
├── cart/success/page.tsx                    # UPDATED (COD only)
└── orders/[id]/page.tsx                     # NEW or UPDATED

features/checkout/
└── components/
    └── checkout-content.tsx                 # UPDATED (split flows)
```

### Module Organization

- **Domain-Driven**: Each feature (orders, payments) owns its components
- **Shared Types**: Global types in `types/` folder
- **Hooks**: Reusable logic in feature-specific `hooks/` folders
- **Services**: API calls in `services/` folders (already exist)

### Naming Conventions

- **Components**: PascalCase (`PaymentWaitingDialog.tsx`)
- **Hooks**: camelCase with `use` prefix (`use-payment-polling.ts`)
- **Types**: PascalCase interfaces (`PaymentStatus`)
- **Enums**: SCREAMING_SNAKE_CASE values (`OrderStatus.PENDING`)

---

## Implementation Notes

**Key technical details to remember:**

### Phase 1: Foundation & Shared Components

#### Task 1.1: OrderStatusBadge Component

**File**: `features/orders/components/order-status-badge.tsx`

**Implementation Pattern**:

```typescript
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; variant: string }> = {
  [OrderStatus.PENDING]: { label: "Đang xử lý", variant: "warning" },
  [OrderStatus.CONFIRMED]: { label: "Đã xác nhận", variant: "info" },
  [OrderStatus.SHIPPED]: { label: "Đang giao hàng", variant: "secondary" },
  [OrderStatus.DELIVERED]: { label: "Đã giao hàng", variant: "success" },
  [OrderStatus.CANCELLED]: { label: "Đã hủy", variant: "destructive" },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant as any} className={className}>
      {config.label}
    </Badge>
  );
}
```

**Notes**:

- Use shadcn Badge with variants: `default`, `secondary`, `destructive`, `outline`
- Map custom variants to semantic colors (yellow → warning, green → success)
- Keep mapping centralized for easy updates

---

#### Task 1.2: PaymentStatusBadge Component

**File**: `features/payments/components/payment-status-badge.tsx`

**Same pattern as OrderStatusBadge**, just different status enum:

```typescript
const statusConfig: Record<PaymentStatus, { label: string; variant: string }> =
  {
    [PaymentStatus.UNPAID]: { label: "Chưa thanh toán", variant: "warning" },
    [PaymentStatus.PAID]: { label: "Đã thanh toán", variant: "success" },
  };
```

---

#### Task 1.3: usePaymentPolling Hook

**File**: `features/payments/hooks/use-payment-polling.ts`

**Implementation Pattern**:

```typescript
import { useState, useEffect, useRef } from "react";
import { paymentsApi } from "@/features/payments/services/payments.service";
import { PaymentStatus } from "@/types";

interface UsePaymentPollingOptions {
  interval?: number; // Default: 5000ms
  maxAttempts?: number; // Default: 180 (15 min)
  onSuccess?: (payment: Payment) => void;
  onTimeout?: () => void;
  onError?: (error: string) => void;
}

export function usePaymentPolling(
  orderId: string,
  options: UsePaymentPollingOptions = {},
) {
  const {
    interval = 5000,
    maxAttempts = 180,
    onSuccess,
    onTimeout,
    onError,
  } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!orderId) return;

    setIsPolling(true);

    const poll = async () => {
      try {
        const payment = await paymentsApi.getByOrder(orderId);
        setAttempts((prev) => prev + 1);
        retryCountRef.current = 0; // Reset retry on success

        // Stop conditions
        if (payment.status === PaymentStatus.PAID) {
          stopPolling();
          onSuccess?.(payment);
        } else if (attempts >= maxAttempts) {
          stopPolling();
          onTimeout?.();
        }
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);

        // Retry logic (max 3 retries)
        retryCountRef.current++;
        if (retryCountRef.current >= 3) {
          stopPolling();
          onError?.(errorMsg);
        }
      }
    };

    // Initial poll
    poll();

    // Start interval
    intervalRef.current = setInterval(poll, interval);

    // Cleanup
    return () => {
      stopPolling();
    };
  }, [orderId, interval, maxAttempts]);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  return { isPolling, attempts, error, stopPolling };
}
```

**Key Points**:

- Use `useRef` for interval (avoid closure issues)
- Automatic cleanup on unmount
- Retry logic for network errors (max 3 retries)
- Stop polling on success, timeout, or fatal error

---

#### Task 1.4: Update Type Definitions

**File**: `types/order.types.ts`

```typescript
// Add enum
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

// Update Order interface
export interface Order {
  id: string;
  userId: string;

  // Add new fields
  orderStatus: OrderStatus; // NEW
  paymentStatus: PaymentStatus; // NEW

  // Existing fields...
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: "COD" | "SEPAY";
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**File**: `types/payment.types.ts`

```typescript
// Add enum
export enum PaymentStatus {
  UNPAID = "unpaid", // Chưa thanh toán
  PAID = "paid", // Đã thanh toán
}

// Update Payment interface
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: "COD" | "SEPAY";

  status: PaymentStatus; // Already exists, just ensure enum

  // SePay specific
  qrCodeUrl?: string; // NEW (add if missing)
  accountNumber?: string; // NEW
  bankName?: string; // NEW

  createdAt: Date;
  paidAt: Date | null;
}
```

**File**: `types/index.ts`

```typescript
// Export new enums
export { OrderStatus } from "./order.types";
export { PaymentStatus } from "./payment.types";
```

---

### Phase 2: Core Dialog Components

#### Task 2.1: PaymentWaitingDialog Component

**File**: `features/payments/components/payment-waiting-dialog.tsx`

**Implementation Pattern**:

```typescript
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePaymentPolling } from "@/features/payments/hooks/use-payment-polling";
import { ordersApi } from "@/features/orders/services/orders.service";
import type { Order } from "@/types";

interface PaymentWaitingDialogProps {
  open: boolean;
  orderId: string;
  paymentId: string;
  qrCodeUrl: string;
  onSuccess: (order: Order) => void;
  onTimeout: () => void;
  onError: (error: string) => void;
}

export function PaymentWaitingDialog({
  open,
  orderId,
  paymentId,
  qrCodeUrl,
  onSuccess,
  onTimeout,
  onError,
}: PaymentWaitingDialogProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  // Start polling
  const { isPolling, attempts, error } = usePaymentPolling(orderId, {
    onSuccess: async () => {
      const order = await ordersApi.getById(orderId);
      onSuccess(order);
    },
    onTimeout,
    onError,
  });

  // Countdown timer
  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle>Quét mã QR để thanh toán</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          </div>

          {/* Order Info */}
          <div className="text-center text-sm text-muted-foreground">
            Mã đơn hàng:{" "}
            <span className="font-mono font-semibold">{orderId}</span>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Thời gian còn lại:{" "}
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Polling Status */}
          {isPolling && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span>Đang chờ thanh toán...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Key Points**:

- Ẩn nút đóng khi đang polling để tránh đóng dialog giữa chừng
- Countdown timer runs independently of polling
- Fetch full order data on success (for PaymentSuccessDialog)
- Error state displayed inline (no retry button yet, can add)

---

#### Task 2.2: PaymentSuccessDialog Component

**File**: `features/payments/components/payment-success-dialog.tsx`

**Implementation Pattern**:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import type { Order } from "@/types";

interface PaymentSuccessDialogProps {
  open: boolean;
  order: Order;
  onViewOrder: (orderId: string) => void;
  autoRedirect?: boolean; // Default: true
  redirectDelay?: number; // Default: 3000ms
}

export function PaymentSuccessDialog({
  open,
  order,
  onViewOrder,
  autoRedirect = true,
  redirectDelay = 3000,
}: PaymentSuccessDialogProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(redirectDelay / 1000);

  // Auto redirect
  useEffect(() => {
    if (!open || !autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onViewOrder(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, autoRedirect, order.id, onViewOrder]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Đơn hàng đã đặt thành công!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã đơn hàng:</span>
              <span className="font-mono font-semibold">{order.id}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tổng tiền:</span>
              <span className="font-semibold">
                {(order.totalAmount / 100).toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phương thức:</span>
              <span>{order.paymentMethod === "COD" ? "COD" : "SePay"}</span>
            </div>

            {/* Status Badges */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Trạng thái đơn hàng:
              </span>
              <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Trạng thái thanh toán:
              </span>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          {/* Auto Redirect Message */}
          {autoRedirect && countdown > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Chuyển trang sau {countdown} giây...
            </p>
          )}

          {/* Manual Button */}
          <Button
            onClick={() => onViewOrder(order.id)}
            className="w-full"
            size="lg"
          >
            Xem chi tiết đơn hàng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Key Points**:

- Use `CheckCircle2` from `lucide-react` for success icon
- Auto redirect with countdown (can be disabled)
- Manual button for immediate redirect
- Display both order status and payment status badges

---

### Phase 3: Integration & Refactoring

#### Task 3.1: Refactor CheckoutContent Component

**File**: `features/checkout/components/checkout-content.tsx`

**Changes** (only show modified parts):

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PaymentWaitingDialog } from "@/features/payments/components/payment-waiting-dialog";
import { PaymentSuccessDialog } from "@/features/payments/components/payment-success-dialog";
import type { Order } from "@/types";

export function CheckoutContent() {
  // Existing state...
  const [selectedPayment, setSelectedPayment] = useState<"COD" | "SEPAY">(
    "COD",
  );

  // NEW: Dialog states
  const [waitingDialogOpen, setWaitingDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Create order (existing logic)
      const order = await ordersApi.create({
        userId,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddressId: selectedAddress.id,
        paymentMethod: selectedPayment,
      });

      // CHANGED: Branch based on payment method
      if (selectedPayment === "COD") {
        // COD flow: redirect to success page
        router.push(`/cart/success?orderId=${order.id}&paymentMethod=COD`);
      } else if (selectedPayment === "SEPAY") {
        // SePay flow: process payment to get QR then open dialog
        const payment = await paymentsApi.process(order.id, "SEPAY", totalInt);
        setCreatedOrderId(order.id);
        setPaymentId(payment.paymentId || "");
        setQrCodeUrl(payment.qrCode || "");
        setWaitingDialogOpen(true);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Success handler
  const handlePaymentSuccess = async (order: Order) => {
    setWaitingDialogOpen(false);
    setCompletedOrder(order);
    setSuccessDialogOpen(true);

    // Clear cart
    await clearCart();
  };

  // NEW: Timeout handler
  const handlePaymentTimeout = () => {
    setWaitingDialogOpen(false);
    toast.error("Thanh toán hết thời gian. Vui lòng thử lại.");
  };

  // NEW: Error handler
  const handlePaymentError = (error: string) => {
    setWaitingDialogOpen(false);
    toast.error(error);
  };

  // NEW: View order handler
  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div>
      {/* Existing checkout UI... */}

      {/* NEW: Dialogs */}
      {waitingDialogOpen && (
        <PaymentWaitingDialog
          open={waitingDialogOpen}
          orderId={completedOrder?.id || ""}
          paymentId={paymentId}
          qrCodeUrl={qrCodeUrl}
          onSuccess={handlePaymentSuccess}
          onTimeout={handlePaymentTimeout}
          onError={handlePaymentError}
        />
      )}

      {successDialogOpen && completedOrder && (
        <PaymentSuccessDialog
          open={successDialogOpen}
          order={completedOrder}
          onViewOrder={handleViewOrder}
          autoRedirect={true}
          redirectDelay={3000}
        />
      )}
    </div>
  );
}
```

**Key Changes**:

1. Add dialog state variables
2. Split `handleCheckout` into COD vs SePay branches
3. Add success/timeout/error handlers
4. Render dialogs conditionally

---

#### Task 3.2: Update Success Page for COD Only

**File**: `app/(shop)/cart/success/page.tsx`

**Changes**:

```typescript
"use client";

import { useEffect } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentMethod = searchParams.get("paymentMethod");

  // CHANGED: Redirect SePay to orders page
  useEffect(() => {
    if (paymentMethod !== "COD") {
      redirect("/orders");
    }
  }, [paymentMethod]);

  // Existing logic for COD...
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      const data = await ordersApi.getById(orderId);
      setOrder(data);

      // Clear cart
      await cartApi.clear();
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div>
      <h1>Đơn hàng đã đặt thành công!</h1>
      <p>Cảm ơn bạn đã mua hàng. Bạn sẽ thanh toán khi nhận hàng.</p>

      {/* NEW: Display status badges */}
      <div className="space-y-2">
        <div>
          Trạng thái đơn hàng: <OrderStatusBadge status={order.orderStatus} />
        </div>
        <div>
          Trạng thái thanh toán:{" "}
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Existing order summary... */}
    </div>
  );
}
```

**Key Changes**:

1. Check payment method → redirect SePay away
2. Remove SePay-specific logic (QR display, polling)
3. Add status badges
4. Keep COD success message

---

## Patterns & Best Practices

**Design patterns being used:**

### 1. Custom Hooks Pattern

- Extract complex logic into reusable hooks
- Example: `usePaymentPolling` encapsulates polling logic
- Benefits: Testable, reusable, separation of concerns

### 2. Compound Components Pattern

- Dialogs composed of smaller pieces (Header, Content, Footer)
- Example: `Dialog` + `DialogContent` + `DialogHeader`
- Benefits: Flexible, composable

### 3. Conditional Rendering Pattern

- Render dialogs based on state
- Example: `{waitingDialogOpen && <PaymentWaitingDialog />}`
- Benefits: Clean, React-idiomatic

### 4. Callback Props Pattern

- Parent passes callbacks to child components
- Example: `onSuccess`, `onTimeout`, `onError` in dialogs
- Benefits: Decoupled, testable

---

## Integration Points

**How do pieces connect?**

### API Integration

- **Payment Status Polling**: `GET /api/payments/:id/status`
- **Order Creation**: `POST /api/orders` (already exists)
- **Order Details**: `GET /api/orders/:id` (already exists)
- **Clear Cart**: `DELETE /api/cart` (already exists)

### Component Integration

- **CheckoutContent** → owns dialog state
- **PaymentWaitingDialog** → uses `usePaymentPolling` hook
- **PaymentSuccessDialog** → displays order with status badges
- **OrderStatusBadge** + **PaymentStatusBadge** → reused across app

### Data Flow

```
User clicks "Đặt hàng"
  → CheckoutContent.handleCheckout()
  → ordersApi.create()
  → Open PaymentWaitingDialog
  → usePaymentPolling starts
  → Poll /api/payments/:id/status every 5s
  → When PAID: Close waiting, open PaymentSuccessDialog
  → Auto redirect to /orders/:id
```

---

## Error Handling

**How do we handle failures?**

### Network Errors

- **Polling failure**: Retry 3 times, then call `onError`
- **Order creation failure**: Show toast, stay on checkout page
- **Cart clear failure**: Log error, continue (non-critical)

### Timeout Errors

- **Payment timeout**: After 15 minutes, call `onTimeout`
- **Show message**: "Thanh toán hết thời gian. Vui lòng thử lại."
- **User action**: Can retry or check order status manually

### Validation Errors

- **Missing address**: Disable checkout button
- **Empty cart**: Redirect to cart page
- **Invalid order ID**: Show 404 error page

### Error Logging

- Use `console.error` for debugging
- Send errors to backend logging service (optional, future)
- Display user-friendly messages (Vietnamese)

---

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

1. **Lazy Load Dialogs**: Only render when open
2. **Memoize Components**: Use `React.memo` for status badges
3. **Debounce Polling**: Already 5s interval (no need for more)
4. **Cancel Requests**: Cleanup on unmount (useEffect return)

### Caching Approach

- Order data cached in component state (no re-fetch)
- Payment status NOT cached (always fresh from polling)
- QR code URL cached after initial fetch

### Resource Management

- Clear intervals on unmount (prevent memory leaks)
- Cancel pending API requests (axios CancelToken)
- Use `AbortController` for fetch requests

---

## Security Notes

**What security measures are in place?**

### Authentication/Authorization

- JWT token sent with all requests (handled by api-client interceptor)
- Backend validates userId from token (no client-side userId passing)
- Order access restricted to owner (backend checks)

### Input Validation

- Order creation data validated by DTOs (backend)
- Payment method restricted to 'COD' | 'SEPAY' (TypeScript + backend)
- No user input in polling (only orderId from backend)

### Data Encryption

- All API calls over HTTPS (production)
- QR code URLs temporary (expire after 15 min)
- No sensitive data in localStorage (only orderId)

### Secrets Management

- No API keys in frontend (backend handles SePay)
- Backend webhook handles payment verification (not client)
- JWT tokens stored in httpOnly cookies (secure)

---

## Known Issues & Limitations

### Current Limitations

1. **No retry button in waiting dialog**: If polling fails, user must refresh page

   - **Mitigation**: Can add manual retry button (low priority)

2. **No email/SMS notification**: User must stay on page to see success

   - **Mitigation**: Future feature (out of scope)

3. **No order status updates in realtime**: User must refresh to see latest status

   - **Mitigation**: Add WebSocket or polling (future)

4. **No support for multiple payment methods**: One payment per order
   - **Mitigation**: Out of scope (business requirement)

### Browser Compatibility

- **Tested**: Chrome, Firefox, Safari, Edge (latest)
- **Mobile**: iOS Safari, Chrome Android
- **Known Issue**: IE11 not supported (React 19 requirement)

---

**Status**: 🚧 Ready for Implementation
**Next**: Start with Task 1.4 (Types) → Foundation → Dialogs → Integration
**Reference**: See planning doc for task breakdown and timeline
