---
phase: testing
title: VIP Customer Management & Promotions - Frontend Testing
description: Comprehensive test strategy for frontend components
---

# Testing Strategy - Frontend

## Test Coverage Goals

- **Unit Test Coverage**: ≥85% for new/changed code
- **Integration Test Scope**: Critical user interactions + API integration
- **E2E Test Scenarios**: Key customer and admin journeys
- **Alignment**: All tests map to requirements and design acceptance criteria

## Unit Tests

### Component Testing

#### VIPBadge Component

**File**: `components/promotions/vip-badge.test.tsx`

- [ ] **Test 1.1**: Renders null for STANDARD tier
  ```tsx
  render(<VIPBadge tier={VipTier.STANDARD} />)
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  ```

- [ ] **Test 1.2**: Renders Bronze badge with correct icon and color
  ```tsx
  render(<VIPBadge tier={VipTier.BRONZE} />)
  expect(screen.getByText(/bronze/i)).toBeInTheDocument()
  expect(screen.getByText('🥉')).toBeInTheDocument()
  ```

- [ ] **Test 1.3**: Renders all tiers correctly (Silver, Gold, Platinum)

- [ ] **Test 1.4**: Respects showLabel prop
  ```tsx
  render(<VIPBadge tier={VipTier.GOLD} showLabel={false} />)
  expect(screen.queryByText('Gold')).not.toBeInTheDocument()
  expect(screen.getByText('🥇')).toBeInTheDocument()
  ```

- [ ] **Test 1.5**: Applies custom className
  ```tsx
  render(<VIPBadge tier={VipTier.GOLD} className="custom-class" />)
  expect(screen.getByLabelText(/vip gold/i)).toHaveClass('custom-class')
  ```

- [ ] **Test 1.6**: Has proper ARIA label for accessibility

```typescript
// components/promotions/vip-badge.test.tsx
import { render, screen } from '@testing-library/react'
import { VIPBadge } from './vip-badge'
import { VipTier } from '@/types/promotion.types'

describe('VIPBadge', () => {
  it('renders null for STANDARD tier', () => {
    render(<VIPBadge tier={VipTier.STANDARD} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders Bronze badge with correct icon and text', () => {
    render(<VIPBadge tier={VipTier.BRONZE} />)
    expect(screen.getByText(/bronze/i)).toBeInTheDocument()
    expect(screen.getByText('🥉')).toBeInTheDocument()
    expect(screen.getByLabelText(/vip bronze/i)).toBeInTheDocument()
  })

  it('hides label when showLabel is false', () => {
    render(<VIPBadge tier={VipTier.GOLD} showLabel={false} />)
    expect(screen.queryByText('Gold')).not.toBeInTheDocument()
    expect(screen.getByText('🥇')).toBeInTheDocument()
  })
})
```

---

#### VIPStatusCard Component

**File**: `features/promotions/components/vip-status-card.test.tsx`

- [ ] **Test 2.1**: Shows loading skeleton while fetching data
  ```tsx
  render(<VIPStatusCard />)
  expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  ```

- [ ] **Test 2.2**: Displays VIP info correctly for Bronze tier
  ```tsx
  mockUseMyVipInfo.mockReturnValue({
    data: {
      currentTier: VipTier.BRONZE,
      totalSpentInt: 600_000_000,
      discountRate: 0.05,
      nextTier: { tier: VipTier.SILVER, remaining: 900_000_000 }
    },
    isLoading: false,
  })
  
  render(<VIPStatusCard />)
  expect(screen.getByText('6,000,000₫')).toBeInTheDocument()
  expect(screen.getByText('5%')).toBeInTheDocument()
  ```

- [ ] **Test 2.3**: Shows progress to next tier
  ```tsx
  expect(screen.getByText(/spend.*9,000,000₫.*more/i)).toBeInTheDocument()
  ```

- [ ] **Test 2.4**: Doesn't show next tier for Platinum
  ```tsx
  mockUseMyVipInfo.mockReturnValue({
    data: { currentTier: VipTier.PLATINUM, nextTier: null }
  })
  render(<VIPStatusCard />)
  expect(screen.queryByText(/next tier/i)).not.toBeInTheDocument()
  ```

- [ ] **Test 2.5**: Shows error state when API fails
  ```tsx
  mockUseMyVipInfo.mockReturnValue({
    data: null,
    isLoading: false,
    error: new Error('API failed'),
  })
  render(<VIPStatusCard />)
  expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  ```

---

#### DiscountCodeInput Component

**File**: `features/promotions/components/discount-code-input.test.tsx`

- [ ] **Test 3.1**: Renders input field and Apply button
  ```tsx
  render(<DiscountCodeInput subtotalInt={100_000_000} onApplied={vi.fn()} onRemove={vi.fn()} />)
  expect(screen.getByPlaceholderText(/enter discount code/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument()
  ```

- [ ] **Test 3.2**: Converts input to uppercase automatically
  ```tsx
  const { user } = setup(<DiscountCodeInput ... />)
  const input = screen.getByPlaceholderText(/enter discount code/i)
  await user.type(input, 'gold10')
  expect(input).toHaveValue('GOLD10')
  ```

- [ ] **Test 3.3**: Disables Apply button when input is empty
  ```tsx
  expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled()
  ```

- [ ] **Test 3.4**: Calls onApplied when valid code applied
  ```tsx
  const onApplied = vi.fn()
  mockValidateMutation.mockResolvedValue({
    valid: true,
    discountedInt: 10_000_000,
  })
  
  await user.type(input, 'GOLD10')
  await user.click(screen.getByRole('button', { name: /apply/i }))
  
  await waitFor(() => {
    expect(onApplied).toHaveBeenCalledWith('GOLD10', 10_000_000)
  })
  ```

- [ ] **Test 3.5**: Shows error toast for invalid code
  ```tsx
  mockValidateMutation.mockResolvedValue({
    valid: false,
    error: 'CODE_EXPIRED',
  })
  
  await user.click(screen.getByRole('button', { name: /apply/i }))
  
  await waitFor(() => {
    expect(screen.getByText(/this code has expired/i)).toBeInTheDocument()
  })
  ```

- [ ] **Test 3.6**: Shows applied state with Remove button
  ```tsx
  render(<DiscountCodeInput appliedCode="GOLD10" onRemove={onRemove} />)
  expect(screen.getByText(/gold10.*applied/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  ```

- [ ] **Test 3.7**: Calls onRemove when Remove clicked
  ```tsx
  const onRemove = vi.fn()
  await user.click(screen.getByRole('button', { name: /remove/i }))
  expect(onRemove).toHaveBeenCalled()
  ```

- [ ] **Test 3.8**: Applies code on Enter key press
  ```tsx
  await user.type(input, 'GOLD10{Enter}')
  await waitFor(() => expect(onApplied).toHaveBeenCalled())
  ```

```typescript
// features/promotions/components/discount-code-input.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiscountCodeInput } from './discount-code-input'
import { vi } from 'vitest'

vi.mock('../hooks/use-promotions', () => ({
  useValidateDiscountCode: vi.fn(),
}))

describe('DiscountCodeInput', () => {
  const mockOnApplied = vi.fn()
  const mockOnRemove = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('converts input to uppercase', async () => {
    const user = userEvent.setup()
    render(
      <DiscountCodeInput
        subtotalInt={100_000_000}
        onApplied={mockOnApplied}
        onRemove={mockOnRemove}
      />
    )

    const input = screen.getByPlaceholderText(/enter discount code/i)
    await user.type(input, 'gold10')
    expect(input).toHaveValue('GOLD10')
  })

  it('shows success and calls onApplied for valid code', async () => {
    const user = userEvent.setup()
    const mockValidate = vi.fn().mockResolvedValue({
      valid: true,
      discountedInt: 10_000_000,
    })
    
    useValidateDiscountCode.mockReturnValue({
      mutateAsync: mockValidate,
      isPending: false,
    })

    render(<DiscountCodeInput subtotalInt={100_000_000} onApplied={mockOnApplied} onRemove={mockOnRemove} />)

    await user.type(screen.getByPlaceholderText(/enter/i), 'GOLD10')
    await user.click(screen.getByRole('button', { name: /apply/i }))

    await waitFor(() => {
      expect(mockOnApplied).toHaveBeenCalledWith('GOLD10', 10_000_000)
    })
  })
})
```

---

### Hook Testing

#### useMyVipInfo Hook

**File**: `features/promotions/hooks/use-promotions.test.ts`

- [ ] **Test 4.1**: Fetches VIP info successfully
  ```tsx
  const { result } = renderHook(() => useMyVipInfo(), { wrapper: QueryWrapper })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data?.currentTier).toBe(VipTier.GOLD)
  ```

- [ ] **Test 4.2**: Handles API error gracefully
  ```tsx
  mockApi.getMyVipInfo.mockRejectedValue(new Error('Network error'))
  await waitFor(() => expect(result.current.isError).toBe(true))
  ```

- [ ] **Test 4.3**: Caches data for 5 minutes (staleTime)
  ```tsx
  // Verify query options
  expect(result.current.staleTime).toBe(5 * 60 * 1000)
  ```

---

#### useValidateDiscountCode Hook

**File**: `features/promotions/hooks/use-promotions.test.ts`

- [ ] **Test 4.4**: Mutation succeeds for valid code
  ```tsx
  const { result } = renderHook(() => useValidateDiscountCode(), { wrapper })
  act(() => {
    result.current.mutate({ code: 'GOLD10', subtotalInt: 100_000_000 })
  })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  ```

- [ ] **Test 4.5**: Mutation returns validation error
  ```tsx
  mockApi.validateDiscountCode.mockResolvedValue({ valid: false, error: 'TIER_NOT_MET' })
  await waitFor(() => {
    expect(result.current.data?.valid).toBe(false)
    expect(result.current.data?.error).toBe('TIER_NOT_MET')
  })
  ```

---

## Integration Tests

### Integration Scenario 1: Customer Applies Discount in Checkout

**File**: `e2e/customer-discount-flow.spec.ts`

- [ ] **Scenario 1.1**: Customer with valid tier applies discount successfully
  - Setup: Login as GOLD-tier customer
  - Steps:
    1. Navigate to checkout page
    2. Enter discount code "GOLD10"
    3. Click "Apply"
    4. Verify discount applied and total updated
  - Expected:
    - Success message shown
    - Discount line item appears
    - Total reduced by 10%

- [ ] **Scenario 1.2**: Customer tries invalid code, sees error
  - Steps:
    1. Enter non-existent code "INVALID"
    2. Click "Apply"
  - Expected:
    - Error toast shown: "Invalid discount code"
    - Total unchanged

- [ ] **Scenario 1.3**: Customer removes applied discount
  - Setup: Code already applied
  - Steps:
    1. Click "Remove" button
  - Expected:
    - Discount removed
    - Total reverts to subtotal + shipping

```typescript
// e2e/customer-discount-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Customer Discount Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as GOLD-tier customer
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'gold@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/profile')
  })

  test('applies valid discount code successfully', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout')

    // Enter discount code
    await page.fill('[placeholder*="Enter discount code"]', 'GOLD10')
    await page.click('button:has-text("Apply")')

    // Verify success
    await expect(page.locator('text=/GOLD10.*applied/i')).toBeVisible()
    await expect(page.locator('text=/discount.*applied/i')).toBeVisible()

    // Verify total updated
    const totalBefore = 1000000 // Mock subtotal
    const expectedDiscount = totalBefore * 0.1
    const expectedTotal = totalBefore - expectedDiscount

    await expect(
      page.locator(`text=/total.*${expectedTotal.toLocaleString()}/i`)
    ).toBeVisible()
  })

  test('shows error for invalid code', async ({ page }) => {
    await page.goto('/checkout')
    await page.fill('[placeholder*="Enter discount code"]', 'INVALID')
    await page.click('button:has-text("Apply")')

    // Verify error toast
    await expect(page.locator('text=/invalid discount code/i')).toBeVisible()
  })
})
```

---

### Integration Scenario 2: Admin Manages Discount Codes

**File**: `e2e/admin-promotions.spec.ts`

- [ ] **Scenario 2.1**: Admin creates new discount code
  - Setup: Login as admin
  - Steps:
    1. Navigate to `/admin/promotions`
    2. Click "Create New Code"
    3. Fill form: Code="SUMMER20", Type=Percentage, Value=20, Tier=SILVER
    4. Submit form
  - Expected:
    - Success toast shown
    - Code appears in table
    - Code is active

- [ ] **Scenario 2.2**: Admin edits existing code
  - Steps:
    1. Click edit button on code
    2. Change value to 15
    3. Save
  - Expected:
    - Code updated in table
    - Value shows 15%

- [ ] **Scenario 2.3**: Admin toggles code active status
  - Steps:
    1. Click toggle switch on active code
  - Expected:
    - Code status changes to inactive
    - Switch shows inactive state

- [ ] **Scenario 2.4**: Admin deletes code
  - Steps:
    1. Click delete button
    2. Confirm in dialog
  - Expected:
    - Code removed from table
    - Success toast shown

```typescript
// e2e/admin-promotions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Promotions Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'admin_password')
    await page.click('button[type="submit"]')
    await page.goto('/admin/promotions')
  })

  test('creates new discount code', async ({ page }) => {
    // Click Create button
    await page.click('button:has-text("Create New Code")')

    // Fill form
    await page.fill('[name="code"]', 'SUMMER20')
    await page.selectOption('[name="type"]', 'PERCENTAGE')
    await page.fill('[name="value"]', '20')
    await page.selectOption('[name="requiredTier"]', 'SILVER')

    // Submit
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('text=/created successfully/i')).toBeVisible()
    await expect(page.locator('td:has-text("SUMMER20")')).toBeVisible()
  })

  test('toggles code active status', async ({ page }) => {
    // Find first toggle switch
    const toggle = page.locator('table tbody tr:first-child [role="switch"]')
    const isActive = await toggle.getAttribute('aria-checked')

    // Toggle
    await toggle.click()

    // Verify state changed
    await expect(toggle).toHaveAttribute(
      'aria-checked',
      isActive === 'true' ? 'false' : 'true'
    )
  })
})
```

---

## End-to-End Tests

### Customer Flow: VIP Journey

**File**: `e2e/vip-customer-journey.spec.ts`

- [ ] **E2E 1**: Complete VIP customer lifecycle
  - Steps:
    1. Register new account
    2. View profile → See STANDARD tier
    3. Place order worth 5M VND (simulate backend completion)
    4. Refresh profile → See BRONZE tier upgrade
    5. Go to checkout → Apply BRONZE discount code
    6. Complete order with discount
  - Expected:
    - All steps succeed
    - Tier updates correctly
    - Discount applied and reflected in order total

---

### Admin Flow: VIP Management

**File**: `e2e/admin-vip-management.spec.ts`

- [ ] **E2E 2**: Admin manages customer VIP tiers
  - Steps:
    1. Login as admin
    2. Navigate to `/admin/customers`
    3. Select customer
    4. Click "Change Tier"
    5. Select PLATINUM, enter reason
    6. Submit
    7. Verify customer tier updated
  - Expected:
    - Tier change succeeds
    - Reason saved
    - Audit log entry created

---

## Accessibility Testing

### Manual Accessibility Checks

- [ ] **A11y 1**: VIPBadge - Screen reader announces tier
  ```
  Tool: NVDA/JAWS
  Expected: "VIP Gold status badge"
  ```

- [ ] **A11y 2**: DiscountCodeInput - Keyboard navigation works
  ```
  Tab → Input focused
  Type code → Uppercase converted
  Enter → Applies code (same as clicking Apply)
  Tab → Apply button focused
  Space → Clicks Apply
  ```

- [ ] **A11y 3**: Discount form - All fields have labels
  ```
  Tool: axe DevTools
  Expected: No violations
  ```

- [ ] **A11y 4**: Color contrast meets WCAG AA
  ```
  VIP badges: 
  - Bronze: 4.5:1 minimum
  - Silver: 4.5:1 minimum
  - Gold: 4.5:1 minimum (ensure text is black)
  - Platinum: 4.5:1 minimum
  ```

- [ ] **A11y 5**: Focus indicators visible
  ```
  All interactive elements show visible focus ring
  ```

### Automated Accessibility Tests

```typescript
// __tests__/a11y/vip-components.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

test('VIPBadge has no accessibility violations', async () => {
  const { container } = render(<VIPBadge tier={VipTier.GOLD} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

test('DiscountCodeInput has no accessibility violations', async () => {
  const { container } = render(<DiscountCodeInput subtotalInt={100_000_000} onApplied={vi.fn()} onRemove={vi.fn()} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Test Data

### Mock API Responses

```typescript
// __mocks__/api-responses.ts
export const mockVipInfo = {
  standard: {
    userId: 'user-1',
    currentTier: VipTier.STANDARD,
    totalSpentInt: 0,
    discountRate: 0,
    nextTier: {
      tier: VipTier.BRONZE,
      requiredSpending: 500_000_000,
      remaining: 500_000_000,
    },
  },
  bronze: {
    userId: 'user-2',
    currentTier: VipTier.BRONZE,
    totalSpentInt: 600_000_000,
    discountRate: 0.05,
    nextTier: {
      tier: VipTier.SILVER,
      requiredSpending: 1_500_000_000,
      remaining: 900_000_000,
    },
  },
  platinum: {
    userId: 'user-3',
    currentTier: VipTier.PLATINUM,
    totalSpentInt: 6_000_000_000,
    discountRate: 0.20,
    nextTier: null,
  },
}

export const mockDiscountValidation = {
  valid: {
    valid: true,
    discountCode: { /* ... */ },
    discountedInt: 10_000_000,
    finalTotalInt: 90_000_000,
    error: null,
  },
  expired: {
    valid: false,
    discountCode: null,
    discountedInt: null,
    finalTotalInt: null,
    error: 'CODE_EXPIRED',
  },
  tierNotMet: {
    valid: false,
    error: 'TIER_NOT_MET',
  },
}
```

---

## Test Reporting & Coverage

### Coverage Commands

```bash
# Unit tests with coverage
pnpm test -- --coverage

# E2E tests
pnpm test:e2e

# Specific feature tests
pnpm test -- promotions
```

### Coverage Thresholds

```json
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
```

### Coverage Gaps (Acceptable)

- **Browser-specific APIs**: `window.print()`, clipboard API
- **Third-party integrations**: Payment gateway UI
- **Edge cases**: Extremely large numbers (>2^53)

---

## Performance Testing

### Lighthouse Audit

- [ ] **Perf 1**: Profile page with VIP status
  - Target: Performance score ≥ 90
  - Target: Accessibility score = 100

- [ ] **Perf 2**: Checkout page with discount input
  - Target: Performance score ≥ 85
  - Target: Time to Interactive < 2s

- [ ] **Perf 3**: Admin promotions page
  - Target: Performance score ≥ 80 (admin page, acceptable)
  - Target: Largest Contentful Paint < 2.5s

### Bundle Size Analysis

```bash
pnpm build
npx @next/bundle-analyzer
```

**Targets**:
- Total promotion feature code: < 50KB gzipped
- VIPBadge component: < 2KB gzipped
- DiscountCodeInput component: < 5KB gzipped

---

## Bug Tracking

### Issue Template

```markdown
**Bug ID**: FE-PROM-001
**Severity**: Medium
**Component**: DiscountCodeInput
**Description**: Discount code not applying on first click

**Steps to Reproduce**:
1. Go to checkout
2. Enter valid code "GOLD10"
3. Click "Apply"
4. Code validation fails (works on second click)

**Expected**: Code applies on first click
**Actual**: Requires double-click
**Browser**: Chrome 120
**Fix**: Add debounce to validation mutation
```

---

## Test Execution Checklist

### Before Merging PR

- [ ] All unit tests pass (`pnpm test`)
- [ ] Coverage ≥ 85%
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] E2E tests pass for changed flows
- [ ] Manual testing completed
- [ ] Accessibility audit passed

### Before Production Deployment

- [ ] E2E tests pass on staging
- [ ] Lighthouse audit passed
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met
- [ ] Smoke tests completed

