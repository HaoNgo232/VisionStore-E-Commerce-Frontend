# E2E Testing Guide

## Setup

Playwright đã được cài đặt và cấu hình sẵn.

### Requirements

- Node.js 20+
- pnpm

### Installation

```bash
# Playwright đã có trong dependencies, chỉ cần cài
pnpm install
```

## Running Tests

### Run all E2E tests

```bash
pnpm test:e2e
```

### Run in UI mode (interactive)

```bash
pnpm test:e2e:ui
```

### Debug mode

```bash
pnpm test:e2e:debug
```

### Run specific test file

```bash
pnpm exec playwright test e2e/checkout-cod.spec.ts
```

### Run specific test

```bash
pnpm exec playwright test -g "COD: Complete checkout"
```

## Test Coverage

### Task 4.1: End-to-End Tests

**COD Flow** (`e2e/checkout-cod.spec.ts`) - 3 tests

- ✅ Complete checkout and redirect to success page
- ✅ Cart cleared after successful order
- ✅ View order detail from success page

**SePay Flow** (`e2e/checkout-sepay.spec.ts`) - 5 tests

- ✅ Open waiting dialog after order creation
- ✅ Show success dialog when payment confirmed
- ✅ Auto-redirect after success confirmation (3s countdown)
- ✅ Manual redirect via "Xem chi tiết" button
- ✅ Cart cleared after successful payment

**Total**: 8 test cases

## Configuration

Playwright config: `playwright.config.ts`

Key settings:

- **Base URL**: http://localhost:3000
- **Timeout**: 30s per test
- **Retries**: 0 (dev), 2 (CI)
- **Browsers**: Chromium, Firefox, WebKit
- **Reports**: HTML report in `playwright-report/`

## Debugging

### View test report

```bash
pnpm exec playwright show-report
```

### Slow motion (2s delay between actions)

```bash
pnpm exec playwright test --headed --slow-mo=2000
```

### Run in headed mode (see browser)

```bash
pnpm exec playwright test --headed
```

## Important Notes

- Tests assume you're logged in or auth is mocked
- Payment status is mocked in SePay tests
- Tests run in parallel, ensure isolated test data
- Screenshots saved on failure in `test-results/`
- Videos can be enabled in `playwright.config.ts`

## Troubleshooting

**Tests timeout**: Increase timeout in `playwright.config.ts`
**Network errors**: Check backend is running on http://localhost:3000
**Auth issues**: Verify login/session setup in `test.beforeEach`
**Dialog not appearing**: Check data-testid attributes match components

## Next Steps (Task 4.2 & 4.3)

- [ ] Task 4.2: Unit test coverage verification
- [ ] Task 4.3: UX polish & refinements
