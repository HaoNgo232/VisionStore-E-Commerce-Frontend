# TypeScript ESLint Exceptions - Best Practices

## Khi nào NÊN sử dụng eslint-disable?

### ✅ ACCEPTABLE: False positives với TypeScript control flow

Khi TypeScript không thể narrow type đúng SAU KHI đã check null/undefined + early return:

```typescript
const { data: user } = useQuery(...)

if (!user) {
  return <Loading />
}

// TypeScript VẪN nghĩ user có thể là undefined dù đã return ở trên
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const name = user.fullName // Safe nhưng ESLint báo lỗi
```

**Best practice:**

```typescript
if (!user) {
  return <Loading />;
}

// SAFE: user is guaranteed to be defined after above check
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const name = user.fullName;
```

### ✅ ACCEPTABLE: Zustand store selectors với complex inference

```typescript
// Store type inference issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
const role = useAuthStore.getState().getUserRole();
```

### ❌ KHÔNG NÊN: Tắt rule globally hoặc ignore lỗi thật

```typescript
// ❌ BAD - tắt rule cho cả file
/* eslint-disable @typescript-eslint/no-unsafe-* */

// ❌ BAD - ignore mà không comment giải thích
// eslint-disable-next-line
const data = something.dangerous();
```

## Khi nào KHÔNG NÊN sử dụng eslint-disable?

### ❌ Khi có thể fix bằng proper typing

```typescript
// ❌ BAD
// eslint-disable-next-line
const result = apiCall();

// ✅ GOOD
const result: ExpectedType = apiCall();
// hoặc
const result = apiCall() as ExpectedType;
```

### ❌ Khi logic thật sự unsafe

```typescript
// ❌ BAD - đây là lỗi thật
// eslint-disable-next-line
function dangerous(x: any) {
  return x.something.deeply.nested;
}

// ✅ GOOD - fix logic
function safe(x: unknown): string | null {
  if (typeof x === "object" && x !== null && "something" in x) {
    const something = x.something;
    // continue type checking...
  }
  return null;
}
```

## Rule Configuration Recommendations

**KHÔNG nên tắt các rules này globally:**

- `@typescript-eslint/no-unsafe-*` - Bảo vệ type safety
- `@typescript-eslint/no-explicit-any` - Enforce proper typing
- `@typescript-eslint/no-unused-vars` - Code cleanliness

**CÓ THỂ relax (nếu cần):**

- `@typescript-eslint/no-misused-promises` - Đôi khi quá strict với React event handlers
- `complexity` - Tùy project size

## Workflow khi gặp ESLint error:

1. **Thử fix bằng proper typing TRƯỚC**
2. **Kiểm tra có phải false positive không**
3. **Nếu là false positive VÀ đã verify type-safe:**
   - Thêm eslint-disable với comment giải thích
   - Document trong code review
4. **Track technical debt nếu dùng nhiều eslint-disable**

## Example: Profile Tab Component

```typescript
export function ProfileTab() {
  const { data: user } = useUserProfile();

  // Early return pattern
  if (!user) {
    return <Loading />;
  }

  // SAFE: user is guaranteed to exist after above check
  // TypeScript control flow limitation - cannot narrow type in complex scenarios
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div>
      {/* Safe to use user.* here */}
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
      <h1>{user.fullName}</h1>
    </div>
  );
}
```

## Monitoring & Review

- **Review eslint-disable usage monthly**
- **Track technical debt in docs/ai/technical-debt.md**
- **Consider TypeScript version upgrades** - newer versions may improve control flow analysis
