---
phase: planning
title: VIP Customer Management & Promotions - Frontend Planning
description: Task breakdown, timeline, và dependencies cho frontend implementation
---

# Project Planning & Task Breakdown - Frontend

## Milestones

- [x] **Milestone 1**: Requirements & Design Complete (Week 0)
- [ ] **Milestone 2**: Types, API Layer & Hooks (Week 1)
  - TypeScript types
  - API service
  - React Query hooks
- [ ] **Milestone 3**: Customer-Facing Components (Week 2)
  - VIP badge & status card
  - Discount code input
  - Profile page integration
- [ ] **Milestone 4**: Admin Components (Week 2)
  - Discount code manager
  - VIP tier manager
  - Admin pages
- [ ] **Milestone 5**: Testing & Polish (Week 3)
  - Unit tests (≥85% coverage)
  - E2E tests
  - Accessibility audit
  - Production deployment

## Task Breakdown

### Phase 1: Foundation - Types & API (Days 1-2)

#### Task 1.1: TypeScript Types Definition
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Create `types/promotion.types.ts`
  - `VipTier` enum
  - `DiscountType` enum
  - `VipInfo` interface + Zod schema
  - `DiscountCode` interface + Zod schema
  - `DiscountValidation` interface + Zod schema
  - `CreateDiscountCodeDto` + schema
  - `UpdateVipTierDto` + schema
- [ ] Sync with backend types (`libs/shared/dto/`)
- [ ] Export all types from barrel file

**Files**:
- `types/promotion.types.ts`

**Tests**:
- Validate Zod schemas với sample data

---

#### Task 1.2: API Service Layer
**Duration**: 3 hours  
**Owner**: Frontend Dev

- [ ] Create `services/promotions.service.ts`
  - Extend `BaseApiService`
  - `getMyVipInfo()`
  - `validateDiscountCode()`
  - `applyDiscountCode()`
  - `listDiscountCodes()` (admin)
  - `createDiscountCode()` (admin)
  - `updateDiscountCode()` (admin)
  - `deleteDiscountCode()` (admin)
  - `updateUserVipTier()` (admin)
- [ ] Add proper error handling với `ApiError`
- [ ] Validate responses với Zod schemas

**Files**:
- `services/promotions.service.ts`
- `lib/api-client.ts` (extend if needed)

**Tests**:
- Unit tests với mock fetch
- Error handling scenarios

---

#### Task 1.3: React Query Hooks
**Duration**: 2.5 hours  
**Owner**: Frontend Dev

- [ ] Create `features/promotions/hooks/use-promotions.ts`
  - Query keys factory
  - `useMyVipInfo()` query
  - `useValidateDiscountCode()` mutation
  - `useDiscountCodes()` query (admin)
  - `useCreateDiscountCode()` mutation (admin)
  - `useUpdateDiscountCode()` mutation (admin)
  - `useDeleteDiscountCode()` mutation (admin)
  - `useUpdateVipTier()` mutation (admin)
- [ ] Setup proper cache invalidation
- [ ] Add toast notifications for mutations

**Files**:
- `features/promotions/hooks/use-promotions.ts`

**Tests**:
- Integration tests với React Query test utils
- Mock API responses

---

### Phase 2: Customer-Facing Components (Days 3-6)

#### Task 2.1: VIPBadge Component
**Duration**: 1.5 hours  
**Owner**: Frontend Dev

- [ ] Create `components/promotions/vip-badge.tsx`
  - Props: `tier`, `className`, `showLabel`
  - Tier icons: 🥉 Bronze, 🥈 Silver, 🥇 Gold, 💎 Platinum
  - Tier colors (Tailwind)
  - Return null for STANDARD tier
- [ ] Responsive design
- [ ] Accessible (ARIA labels)

**Files**:
- `components/promotions/vip-badge.tsx`

**Tests**:
- Component tests với Testing Library
- Accessibility tests

---

#### Task 2.2: VIPStatusCard Component
**Duration**: 3 hours  
**Owner**: Frontend Dev

- [ ] Create `features/promotions/components/vip-status-card.tsx`
  - Use `useMyVipInfo()` hook
  - Display current tier với badge
  - Show total spending (formatted)
  - Show discount rate
  - Show progress to next tier
  - Loading skeleton
  - Error state
- [ ] Responsive layout (mobile + desktop)
- [ ] Beautiful card design với gradients/shadows

**Files**:
- `features/promotions/components/vip-status-card.tsx`

**Tests**:
- Component tests with various VIP tiers
- Loading and error states

---

#### Task 2.3: DiscountCodeInput Component
**Duration**: 4 hours  
**Owner**: Frontend Dev

- [ ] Create `features/promotions/components/discount-code-input.tsx`
  - Input field với "Apply" button
  - Loading state khi validate
  - Success message với discount amount
  - Error messages (tier not met, expired, etc.)
  - "Remove" button khi code applied
  - Auto-uppercase input
- [ ] Form validation (không submit rỗng)
- [ ] Accessible (keyboard navigation)

**Files**:
- `features/promotions/components/discount-code-input.tsx`

**Tests**:
- User interaction tests (type, apply, remove)
- Error handling scenarios
- Accessibility tests

---

#### Task 2.4: Integrate VIPBadge into Header
**Duration**: 1 hour  
**Owner**: Frontend Dev

- [ ] Add `<VIPBadge>` to user menu in Header
  - Show next to user name when logged in
  - Load VIP info on mount
  - Only show if tier !== STANDARD
- [ ] Update `components/layout/header.tsx`

**Files**:
- `components/layout/header.tsx`

---

#### Task 2.5: Integrate VIPStatusCard into Profile Page
**Duration**: 1.5 hours  
**Owner**: Frontend Dev

- [ ] Update `app/(account)/profile/page.tsx`
  - Add `<VIPStatusCard>` trong grid
  - Position: right column
  - Responsive: full-width on mobile
- [ ] Ensure page loads VIP data

**Files**:
- `app/(account)/profile/page.tsx`

---

#### Task 2.6: Integrate DiscountCodeInput into Checkout
**Duration**: 3 hours  
**Owner**: Frontend Dev

- [ ] Update `app/(shop)/checkout/page.tsx`
  - Add discount code section
  - State: `appliedCode`, `discountAmount`
  - Pass `subtotalInt` to input component
  - Update total calculation
  - Display discount line item (green)
  - Pass applied discount to order creation
- [ ] Update checkout flow với discount info

**Files**:
- `app/(shop)/checkout/page.tsx`
- `features/checkout/` (if separate feature)

**Tests**:
- E2E test: Apply discount code in checkout
- Total calculation correctness

---

### Phase 3: Admin Components (Days 7-10)

#### Task 3.1: DiscountCodeTable Component
**Duration**: 4 hours  
**Owner**: Frontend Dev

- [ ] Create `features/promotions/components/discount-code-table.tsx`
  - Use `useDiscountCodes()` hook
  - Table columns: Code, Type, Value, Tier, Usage, Expiry, Active, Actions
  - Toggle active/inactive switch
  - Edit button → open modal
  - Delete button → confirmation dialog
  - Loading skeleton
  - Empty state
- [ ] Pagination controls
- [ ] Responsive (horizontal scroll on mobile)

**Files**:
- `features/promotions/components/discount-code-table.tsx`

**Tests**:
- Component tests với mock data
- User interactions (edit, delete, toggle)

---

#### Task 3.2: DiscountCodeFormDialog Component
**Duration**: 5 hours  
**Owner**: Frontend Dev

- [ ] Create `features/promotions/components/discount-code-form-dialog.tsx`
  - Form với react-hook-form + zod
  - Fields:
    - Code (uppercase, 3-20 chars)
    - Description
    - Type (percentage/fixed)
    - Value (number)
    - Required Tier (dropdown)
    - Max Usages (optional)
    - Max Usage Per User (optional)
    - Start Date (date picker)
    - Expiry Date (date picker)
    - Min Purchase (optional)
  - Validation với `CreateDiscountCodeSchema`
  - Submit → create or update mutation
  - Loading state
- [ ] Support both create và edit modes

**Files**:
- `features/promotions/components/discount-code-form-dialog.tsx`

**Tests**:
- Form validation tests
- Submit success/error scenarios

---

#### Task 3.3: Admin Promotions Page
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Create `app/admin/promotions/page.tsx`
  - Header với "Create New Code" button
  - `<DiscountCodeTable>` component
  - Search bar (optional phase 2)
  - Filter by tier, status (optional phase 2)
  - Dialog state management
- [ ] Protect route với admin guard

**Files**:
- `app/admin/promotions/page.tsx`

**Tests**:
- E2E test: Admin creates discount code
- E2E test: Admin edits/deletes code

---

#### Task 3.4: VIPTierUpdateModal Component
**Duration**: 3 hours  
**Owner**: Frontend Dev

- [ ] Create `features/promotions/components/vip-tier-update-modal.tsx`
  - Form với react-hook-form + zod
  - Fields:
    - New Tier (dropdown)
    - Reason (textarea, required, min 10 chars)
  - Validation với `UpdateVipTierSchema`
  - Submit → mutation
  - Confirmation step
  - Loading state

**Files**:
- `features/promotions/components/vip-tier-update-modal.tsx`

**Tests**:
- Form validation
- Submit flow

---

#### Task 3.5: Integrate VIP Tier Manager into Admin Customers Page
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Update `app/admin/customers/page.tsx`
  - Add VIP Tier column to customer table
  - Add "Change Tier" action button
  - Open `<VIPTierUpdateModal>` on click
  - Refresh table after tier update
- [ ] Display current tier với `<VIPBadge>`

**Files**:
- `app/admin/customers/page.tsx`
- `features/users/components/user-list.tsx` (if exists)

---

### Phase 4: Testing & Quality (Days 11-14)

#### Task 4.1: Unit Tests - Components
**Duration**: 4 hours  
**Owner**: Frontend Dev

- [ ] Test all promotion components:
  - `VIPBadge` (all tiers, props combinations)
  - `VIPStatusCard` (loading, error, various tiers)
  - `DiscountCodeInput` (apply, remove, errors)
  - `DiscountCodeTable` (CRUD operations)
  - `DiscountCodeFormDialog` (validation, submit)
  - `VIPTierUpdateModal` (validation, submit)
- [ ] Target: ≥85% coverage

**Files**:
- `features/promotions/components/*.test.tsx`

---

#### Task 4.2: Unit Tests - Hooks & Services
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Test React Query hooks với mock providers
- [ ] Test API service methods với mock fetch
- [ ] Test error handling

**Files**:
- `features/promotions/hooks/use-promotions.test.ts`
- `services/promotions.service.test.ts`

---

#### Task 4.3: E2E Tests - Customer Flows
**Duration**: 3 hours  
**Owner**: Frontend Dev

- [ ] E2E: Customer views VIP status on profile
- [ ] E2E: Customer applies discount code in checkout
  - Valid code → success
  - Invalid code → error message
- [ ] E2E: Customer sees VIP badge in header
- [ ] Use Playwright

**Files**:
- `e2e/vip-customer-flow.spec.ts`

---

#### Task 4.4: E2E Tests - Admin Flows
**Duration**: 3 hours  
**Owner**: Frontend Dev

- [ ] E2E: Admin creates discount code
- [ ] E2E: Admin edits discount code
- [ ] E2E: Admin toggles code active status
- [ ] E2E: Admin deletes discount code
- [ ] E2E: Admin updates customer VIP tier
- [ ] Use Playwright

**Files**:
- `e2e/admin-promotions.spec.ts`

---

#### Task 4.5: Accessibility Audit
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Run axe DevTools on all promotion pages
- [ ] Keyboard navigation testing
  - Tab order correct
  - Focus indicators visible
  - Enter/Escape work in modals
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Color contrast verification (WCAG AA)
- [ ] Fix any issues found

**Files**:
- Fix issues in respective components

---

#### Task 4.6: Responsive Design Testing
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Test on mobile (375px, 414px)
- [ ] Test on tablet (768px, 1024px)
- [ ] Test on desktop (1280px, 1920px)
- [ ] Fix any layout issues
- [ ] Test touch interactions on mobile

**Devices**:
- Chrome DevTools device emulation
- Real devices (iOS Safari, Android Chrome)

---

### Phase 5: Polish & Deployment (Days 15-16)

#### Task 5.1: Loading & Error States
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Review all components for loading states
- [ ] Add skeleton loaders where missing
- [ ] Improve error messages (user-friendly)
- [ ] Add retry buttons for failed requests
- [ ] Add empty states với illustrations

**Files**:
- Update various components

---

#### Task 5.2: Performance Optimization
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Add `useMemo` cho expensive calculations
- [ ] Add `useCallback` cho callback props
- [ ] Lazy load admin components
  ```tsx
  const DiscountCodeTable = lazy(() => import('./discount-code-table'))
  ```
- [ ] Optimize images (if any)
- [ ] Check bundle size với `next/bundle-analyzer`

**Files**:
- Update various components

---

#### Task 5.3: Documentation
**Duration**: 1 hour  
**Owner**: Frontend Dev

- [ ] Update README với VIP feature info
- [ ] Document environment variables (if any)
- [ ] Add JSDoc comments cho public APIs
- [ ] Update Storybook (if used)

**Files**:
- `README.md`
- Component files

---

#### Task 5.4: Code Review & Refactoring
**Duration**: 2 hours  
**Owner**: Frontend Dev

- [ ] Self code review
- [ ] Fix ESLint warnings/errors
- [ ] Fix TypeScript strict mode issues
- [ ] Refactor duplicated code
- [ ] Follow project code style rules

**Files**:
- All promotion feature files

---

#### Task 5.5: Production Deployment Preparation
**Duration**: 1 hour  
**Owner**: Frontend Dev

- [ ] Verify environment variables for production
- [ ] Test production build locally
  ```bash
  pnpm build
  pnpm start
  ```
- [ ] Check for console errors/warnings
- [ ] Verify API endpoints point to production backend

**Files**:
- `.env.production`
- `next.config.mjs`

---

## Dependencies

### Critical Path
```
Task 1.1 (Types) → Task 1.2 (API) → Task 1.3 (Hooks) → Task 2.x (Customer Components)
Task 1.3 (Hooks) → Task 3.x (Admin Components)
All Phase 2, 3 → Phase 4 (Testing)
```

### Blockers
- **Task 1.2, 1.3** depend on Task 1.1 (types defined)
- **All Phase 2 tasks** depend on Task 1.3 (hooks ready)
- **All Phase 3 tasks** depend on Task 1.3 (hooks ready)
- **Phase 4** depends on all Phase 2, 3 (implementation complete)
- **Task 2.6** (Checkout integration) depends on existing checkout flow understanding

### External Dependencies
- Backend API endpoints must be available (from backend Phase 3)
- Backend must return correct response formats (match frontend types)
- Auth system must support admin role checks

## Timeline & Estimates

| Phase                    | Duration | Start Date | End Date   |
| ------------------------ | -------- | ---------- | ---------- |
| Phase 1: Foundation      | 2 days   | Week 1 Mon | Week 1 Tue |
| Phase 2: Customer UI     | 4 days   | Week 1 Wed | Week 2 Mon |
| Phase 3: Admin UI        | 4 days   | Week 2 Tue | Week 2 Fri |
| Phase 4: Testing         | 4 days   | Week 3 Mon | Week 3 Thu |
| Phase 5: Polish & Deploy | 2 days   | Week 3 Fri | Week 3 Sat |
| **Total**                | **16 days** | **Week 1 Mon** | **Week 3 Sat** |

**Buffer**: +3 days cho unknowns = **Total 3 weeks**

### Effort Breakdown
- Foundation: 7.5 hours
- Customer UI: 14 hours
- Admin UI: 16 hours
- Testing: 16 hours
- Polish & Deploy: 8 hours
- **Total**: ~61.5 hours (~8 working days for 1 developer)

## Risks & Mitigation

### Risk 1: Backend API Changes
**Probability**: Medium  
**Impact**: High (type mismatches, broken integrations)

**Mitigation**:
- Sync with backend team daily
- Use Zod validation để catch response changes early
- Write integration tests với real API calls (staging)
- Version API endpoints if breaking changes

---

### Risk 2: Complex Checkout Flow Integration
**Probability**: Medium  
**Impact**: Medium (discount not applied correctly)

**Mitigation**:
- Review existing checkout code thoroughly first
- Write E2E tests for checkout với discount
- Test edge cases (apply → remove → apply again)
- Get feedback from backend team on order discount handling

---

### Risk 3: UI/UX Complexity
**Probability**: Low  
**Impact**: Medium (poor user experience)

**Mitigation**:
- Follow design system (shadcn/ui)
- Get UI/UX review from stakeholders
- Conduct user testing (if possible)
- Iterate based on feedback

---

### Risk 4: TypeScript Type Safety Issues
**Probability**: Low  
**Impact**: High (runtime errors)

**Mitigation**:
- Use Zod schemas for all API responses
- Enable TypeScript strict mode
- Write type tests
- Use ESLint rules: `no-explicit-any`, `no-unsafe-*`

---

### Risk 5: Performance Issues
**Probability**: Low  
**Impact**: Medium (slow UI, poor UX)

**Mitigation**:
- Lazy load heavy components
- Optimize re-renders với React.memo
- Use React Query caching effectively
- Monitor bundle size

---

## Resources Needed

### Team
- **1x Frontend Developer**: Full-time (16 days)
- **0.5x UI/UX Designer**: Part-time (design review, feedback)

### Tools & Services
- Next.js 14
- shadcn/ui components
- React Query (TanStack Query)
- Zod validation
- Playwright (E2E testing)
- Jest + Testing Library (unit tests)

### Design Assets
- VIP tier icons (emoji OK, or custom SVG)
- Badge colors (already defined in design doc)
- No additional design work required (use shadcn/ui defaults)

### Documentation
- Frontend design doc (already created)
- Component API docs (JSDoc)
- E2E test reports

## Success Criteria

### Functional
- [ ] VIP badge displays correctly based on tier
- [ ] VIP status card shows accurate info
- [ ] Discount code input validates correctly
- [ ] Discount applies to checkout total
- [ ] Admin can CRUD discount codes
- [ ] Admin can update user VIP tiers

### Technical
- [ ] Unit test coverage ≥ 85%
- [ ] E2E tests pass for critical flows
- [ ] No TypeScript `any` types
- [ ] No ESLint errors
- [ ] Lighthouse score ≥ 90 (performance, accessibility)
- [ ] Bundle size increase < 100KB

### Quality
- [ ] Code review approved
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Responsive design verified on all breakpoints
- [ ] Cross-browser testing passed (Chrome, Firefox, Safari)
- [ ] Production deployment successful

