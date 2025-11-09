# Frontend Next.js - Type Safety & Clean Code Instructions

## **Core Principles**

### **1. Type Safety 100% - TUYỆT ĐỐI KHÔNG DÙNG `any`**

- Mọi biến, function, component props phải có type definitions rõ ràng
- Sử dụng `unknown` thay vì `any` khi cần xử lý dữ liệu không rõ type
- Luôn validate types từ API responses bằng Zod hoặc type guards
- Sử dụng strict TypeScript config với `noImplicitAny`, `strictNullChecks`

### **2. Backend Type Synchronization**

- Tham khảo backend types tại: `@shared/types/` và `@shared/dto/`
- Khi phát hiện type mismatch giữa FE/BE, báo cáo ngay với 3 options:
  - **Option A**: Cập nhật FE types theo BE + adapter
  - **Option B**: Đề xuất BE thay đổi + version hóa nếu breaking
  - **Option C**: Tạo transformation layer chấp nhận cả 2 format

### **3. SOLID Principles**

- **Single Responsibility**: Mỗi component/hook chỉ có 1 trách nhiệm
- **Open/Closed**: Mở rộng qua composition, không modify existing code
- **Liskov Substitution**: Interface/type substitution phải nhất quán
- **Interface Segregation**: Tạo interfaces nhỏ, chuyên biệt
- **Dependency Inversion**: Depend on abstractions, không phải implementations

### **4. Next.js Best Practices**

- Ưu tiên Server Components, chỉ dùng Client Components khi cần
- Dynamic route params: `{ params }: { params: { slug: string } }` (không Promise)
- Proper error boundaries và loading states
- Type-safe API routes và data fetching

## **Type Mismatch Detection & Resolution**

Khi phát hiện sai lệch type giữa Frontend và Backend:

**Bước 1: Báo cáo**

```
PHÁT HIỆN: [Mô tả ngắn gọn sai lệch]

VỊ TRÍ: [File/component/API endpoint]

NGUY CƠ: [Runtime error, UI bug, data corruption, etc.]
```

**Bước 2: Đề xuất 3 phương án**

- **Option A - FE Adaptation**: Cập nhật FE types + adapter (nhanh, ít risk BE)
- **Option B - BE Standardization**: Chuẩn hóa BE response + versioning
- **Option C - Dual Support**: Decoder chấp nhận cả 2 format + migration plan

**Bước 3: Implementation Plan**

- Files cần thay đổi
- Types cần thêm/sửa
- Tests cần cập nhật
- Timeline và owner

## **Backend Type Synchronization - 4 Phương án**

### **Phương án 1: Code Generation (Khuyến nghị)**

- **Mô tả**: Tự động tạo TypeScript types từ OpenAPI/Swagger spec
- **Ưu điểm**: Độ chính xác cao, tự động cập nhật, giảm lỗi con người
- **Nhược điểm**: Setup phức tạp, cần backend cung cấp schema
- **Tools**: `openapi-typescript`, `graphql-codegen`

### **Phương án 2: Shared Types trong Monorepo**

- **Mô tả**: Chia sẻ DTOs/types trực tiếp giữa FE/BE
- **Ưu điểm**: Single source of truth, compile-time error detection
- **Nhược điểm**: Yêu cầu monorepo structure

### **Phương án 3: Runtime Validation với Manual Mapping**

- **Mô tả**: Định nghĩa types thủ công + Zod validation
- **Ưu điểm**: Linh hoạt, bảo vệ runtime, infer types từ schema
- **Nhược điểm**: Dễ lỗi, không phát hiện compile-time mismatch

### **Phương án 4: Contract Testing**

- **Mô tả**: Automated tests để verify API contracts
- **Ưu điểm**: Early detection trong CI/CD, đảm bảo compatibility
- **Nhược điểm**: Phức tạp, cần investment cao cho testing

## **Template Báo cáo Type Mismatch**

Khi phát hiện sai lệch, sử dụng template sau:

```markdown
## TYPE MISMATCH DETECTED

**Location**: `features/orders/components/order-item.tsx`

**Issue**: `order.items[].product` shape inconsistency

- Page A uses: `item.imageUrls[0]`, `item.productName`
- Page B uses: `item.product?.images`, `item.product?.name`

**Risk**: Runtime errors, inconsistent UI display

## RESOLUTION OPTIONS

### Option A: Standardize Frontend Types + Adapter

**Action**: Create canonical `OrderItem` type + transformation functions

**Pros**: Quick fix, minimal BE impact, type-safe

**Cons**: Additional adapter layer

**Timeline**: 1-2 days

**Files**: `types/order.types.ts`, `services/orders.adapter.ts`

### Option B: Backend API Standardization

**Action**: Request BE to return consistent `OrderItem` structure

**Pros**: Single source of truth, cleaner FE code

**Cons**: Requires BE team coordination, potential breaking change

**Timeline**: 1-2 weeks (if versioning needed)

**Files**: Backend API response format

### Option C: Dual Format Support + Migration

**Action**: Zod union schema accepting both formats → canonical type

**Pros**: No blocking dependencies, gradual migration

**Cons**: Technical debt, cleanup needed later

**Timeline**: 3-5 days + future cleanup

**Files**: `schemas/order.schema.ts`, migration plan

## RECOMMENDATION: Option A

Create adapter layer for immediate fix, then coordinate with BE team for Option B long-term.
```

## **Default Parameters Best Practices**

### **❌ TRÁNH: Default Parameter với Object Literal**

Default parameter với object literal `= {}` gây ra TypeScript strict mode false positives và unsafe member access errors. Đây là một vấn đề phổ biến với TypeScript strict mode và ESLint.

```typescript
// ❌ WRONG - Gây false positives với TypeScript strict mode
async function listUsers(query: ListUsersQuery = {}): Promise<ListUsersResponse> {
  // TypeScript không thể infer type đúng, gây unsafe member access errors
  if (query.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
}

// ❌ WRONG - Cần nhiều eslint-disable comments (không clean)
async function listUsers(query: ListUsersQuery = {}): Promise<ListUsersResponse> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (query.page !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
    searchParams.set("page", query.page.toString());
  }
}
```

### **✅ ĐÚNG: Optional Parameter + Optional Chaining**

Sử dụng optional parameter `?` và optional chaining `?.` để tránh false positives. Đây là best practice được TypeScript community khuyến nghị.

```typescript
// ✅ CORRECT - Type-safe, không có false positives, clean code
async function listUsers(query?: ListUsersQuery): Promise<ListUsersResponse> {
  const searchParams = new URLSearchParams();
  
  if (query?.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
  if (query?.pageSize !== undefined) {
    searchParams.set("pageSize", query.pageSize.toString());
  }
  if (query?.search) {
    searchParams.set("search", query.search);
  }
  if (query?.role) {
    searchParams.set("role", query.role);
  }
  
  const queryString = searchParams.toString();
  const endpoint = queryString ? `/users?${queryString}` : "/users";
  
  return apiGetValidated<ListUsersResponse>(endpoint, schema);
}
```

### **✅ ĐÚNG: Local Interface Definition (Nếu cần)**

Nếu vẫn gặp vấn đề với imported types, định nghĩa local interface trong file để TypeScript infer type tốt hơn:

```typescript
// ✅ CORRECT - Local interface cho better type inference
interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
}

async function listUsers(query?: ListUsersParams): Promise<ListUsersResponse> {
  // TypeScript infer type tốt hơn với local interface
  if (query?.page !== undefined) {
    searchParams.set("page", query.page.toString());
  }
}
```

### **✅ ĐÚNG: Destructuring với Default Values**

Cho function parameters phức tạp với nhiều options, dùng destructuring với default values:

```typescript
// ✅ CORRECT - Destructuring với default values (không gây false positives)
function calculateCartTotals(
  items: CartItem[],
  options: {
    shippingCost?: number;
    taxRate?: number;
    discountAmount?: number;
    freeShippingThreshold?: number;
  } = {},
): CartTotals {
  const {
    shippingCost = 30000, // 30,000 VND
    taxRate = 0.1,
    discountAmount = 0,
    freeShippingThreshold = 500000, // 500,000 VND
  } = options;
  
  // Type-safe usage sau khi destructure
  const subtotal = items.reduce((sum, item) => sum + item.product.priceInt * item.quantity, 0);
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const tax = (subtotal - discountAmount) * taxRate;
  
  return { subtotal, shipping, tax, discount: discountAmount, total: subtotal - discountAmount + shipping + tax };
}
```

### **Lý do và Best Practices:**

1. **TypeScript strict mode**: Default parameter `= {}` với object literal không được TypeScript infer đúng type trong strict mode
2. **ESLint false positives**: Gây ra `@typescript-eslint/no-unsafe-member-access` errors mặc dù code đúng về mặt logic
3. **Code cleanliness**: Tránh phải thêm nhiều `eslint-disable` comments làm code không clean
4. **Better type inference**: Optional parameter `?` cho TypeScript infer type tốt hơn và chính xác hơn
5. **Consistency**: Pattern này được sử dụng trong các file khác như `products.service.ts` và được TypeScript community khuyến nghị

### **Khi nào dùng mỗi pattern:**

- **Optional Parameter `?`**: Cho simple optional objects (khuyến nghị)
- **Local Interface**: Khi imported type gây vấn đề với type inference
- **Destructuring với defaults**: Cho complex options objects với nhiều fields

## **Implementation Best Practices**

### **Component Props với Type Safety**

```typescript
// ✅ Comprehensive prop types
interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
  onFavorite?: (productId: string, isFavorite: boolean) => void;
  className?: string;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, variant = "default", onAddToCart, className, ...props }, ref) => {
    // Type-safe implementation
    const handleAddToCart = async () => {
      try {
        await onAddToCart?.(product.id, 1);
        toast.success("Added to cart");
      } catch (error) {
        toast.error("Failed to add to cart");
      }
    };

    return (
      <div ref={ref} className={cn("product-card", className)} {...props}>
        {/* Implementation */}
      </div>
    );
  },
);
```

### **Form Handling với Zod**

```typescript
// Schema-first approach
const productFormSchema = z.object({
  name: z.string().min(1, "Product name required"),
  priceInt: z.number().int().positive("Price must be positive"),
  categoryId: z.string().uuid("Invalid category"),
  imageUrls: z.array(z.string().url()).default([]),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export function ProductForm({
  onSubmit,
}: {
  onSubmit: (data: ProductFormData) => Promise<void>;
}) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      priceInt: 0,
      categoryId: "",
      imageUrls: [],
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Type-safe form fields */}
      </form>
    </Form>
  );
}
```

## **Validation Checklist**

**Pre-commit Checklist:**

- [ ] Không có `any` types trong code
- [ ] Tất cả API responses được validate bằng Zod/type guards
- [ ] Component props có complete interface definitions
- [ ] Error handling được implement với proper types
- [ ] Form schemas defined với validation rules
- [ ] Tests cover type scenarios và edge cases
- [ ] ESLint + TypeScript rules pass
- [ ] Performance optimizations applied (memo, useMemo, useCallback)
- [ ] Accessibility attributes included
- [ ] Documentation updated cho type changes

**Type Safety Enforcement:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}

// .eslintrc.js
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error"
  }
}
```

Bằng cách tuân thủ những hướng dẫn này, bạn sẽ có một codebase Next.js type-safe 100%, clean, maintainable và đồng bộ hoàn toàn với backend API.
