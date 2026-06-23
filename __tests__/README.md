# Testing Infrastructure - KOINNU Ranting System

## Overview

Testing infrastructure untuk KOINNU Ranting System menggunakan **Vitest** sebagai test runner dan framework utama.

## Status Implementasi

✅ **Testing infrastructure sudah dibuat:**
- Vitest configuration
- Test setup dan utilities
- Mock factories untuk Prisma models
- Sample unit tests untuk withdrawal service
- Test scripts di package.json

⚠️ **Dependencies belum terinstall:**
- Vitest dan testing libraries perlu diinstall via npm
- Ada issue dengan npm permission/timeout saat implementasi
- Perlu resolve npm issues sebelum bisa run tests

## Required Dependencies

Dependencies yang perlu diinstall:

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom happy-dom
```

Atau bisa install satu per satu jika ada timeout:

```bash
npm install --save-dev vitest
npm install --save-dev @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev happy-dom
```

## Project Structure

```
__tests__/
├── setup.ts                          # Test environment setup
├── utils/
│   └── test-helpers.ts              # Mock factories & utilities
└── services/
    └── withdrawals.test.ts          # Sample unit tests
vitest.config.ts                      # Vitest configuration
```

## Running Tests

Setelah dependencies terinstall, gunakan command berikut:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Import Test Utilities

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockPrismaClient, createMockUser } from '../utils/test-helpers'
```

### Mock Prisma

```typescript
vi.mock('@/src/lib/db/prisma', () => ({
  prisma: mockPrismaClient()
}))
```

### Create Test Cases

```typescript
describe('Service Name', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', async () => {
    // Arrange
    const mockData = createMockUser({ name: 'Test' })
    
    // Act
    const result = await someFunction()
    
    // Assert
    expect(result).toBeDefined()
  })
})
```

## Available Mock Factories

Test helpers menyediakan mock factories untuk semua entity utama:

- `createMockUser()` - Mock User dengan role dan status
- `createMockHouse()` - Mock House dengan address dan RT/RW
- `createMockCoinBox()` - Mock CoinBox dengan status
- `createMockWithdrawal()` - Mock Withdrawal dengan amount dan status
- `createMockCashTransaction()` - Mock CashTransaction

Semua factory menerima `overrides` untuk customize data:

```typescript
const user = createMockUser({ 
  name: 'Custom Name',
  email: 'custom@example.com' 
})
```

## Test Coverage Goals

Target coverage untuk production-ready:

- **Services:** 60%+ coverage untuk business logic
- **API Routes:** 80%+ coverage untuk critical endpoints
- **Utilities:** 70%+ coverage

## Next Steps

1. **Resolve npm installation issues** - install required packages
2. **Run existing tests** - verify setup berfungsi
3. **Add more unit tests:**
   - Houses service tests
   - Reports service tests
   - Coin-boxes service tests
   - Finance service tests
4. **Add integration tests** untuk API routes
5. **Setup CI integration** - run tests di Jenkins pipeline

## Notes

- Tests menggunakan in-memory database mock (tidak perlu PostgreSQL untuk unit tests)
- Mock Prisma client di-provide via test-helpers.ts
- Test dates tersedia di `testDates` untuk konsistensi testing
- Environment variables di-mock di setup.ts

## Troubleshooting

### Tests tidak bisa run
- Pastikan dependencies sudah terinstall
- Check `node_modules` ada dan tidak corrupt
- Try `npm install` ulang jika perlu

### Mock tidak bekerja
- Pastikan import path benar dengan alias `@/`
- Check vi.mock() dipanggil sebelum import service
- Verify mock factory return value sesuai Prisma type

### Coverage tidak muncul
- Install `@vitest/coverage-v8` jika belum
- Run dengan flag `--coverage`
- Check exclude patterns di vitest.config.ts
