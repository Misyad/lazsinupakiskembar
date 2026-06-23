# Developer Onboarding - KOINNU Ranting System

## Project Overview

KOINNU Ranting System adalah web application untuk mengelola GERAKAN KOIN NU di tingkat ranting LAZISNU Pakiskembar.

**Tech Stack:**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Next.js API Routes, Node.js
- **Database:** PostgreSQL dengan Prisma ORM
- **Styling:** Tailwind CSS
- **Testing:** Vitest (infrastructure ready)
- **Deployment:** Docker, Jenkins CI/CD

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login)
│   ├── (protected)/       # Protected pages (dashboard, etc.)
│   ├── (public)/          # Public pages (transparansi)
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & helpers
│   ├── security/         # Rate limiting, headers, env validation
│   ├── monitoring/       # Logger, error monitoring
│   └── mobile/           # Mobile utilities & styles
├── src/
│   ├── lib/              # Core libraries
│   │   ├── db/          # Prisma client
│   │   ├── validations/ # Zod schemas
│   │   └── permissions/ # RBAC definitions
│   └── services/        # Business logic services
│       ├── houses/      # Rumah donatur service
│       ├── coin-boxes/  # Kaleng service
│       ├── withdrawals/ # Penarikan service
│       ├── finance/     # Keuangan service
│       └── reports/     # Laporan service
├── prisma/               # Database schema & migrations
├── scripts/
│   └── backup/          # Backup & restore scripts
├── __tests__/           # Test infrastructure
└── docs/                # Documentation
```

## Local Development Setup

### Prerequisites
- Node.js v18+ 
- PostgreSQL v14+
- npm or yarn

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/Misyad/lazsinupakiskembar.git
cd lazsinupakiskembar
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your local database URL
```

4. **Setup Database**
```bash
npm run prisma:generate
npm run db:migrate
npm run db:seed
```

5. **Run Development Server**
```bash
npm run dev
```

Application runs on: http://localhost:3000

### Default Credentials (After Seed)
- Super Admin: `superadmin@koinnu.local` / Check seed file
- Admin Ranting: `admin@koinnu.local` / Check seed file

## Code Conventions

### TypeScript
- Use strict type checking
- Avoid `any` - prefer `unknown` if type uncertain
- Define types/interfaces for API responses
- Use Zod for runtime validation

### File Naming
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- API routes: lowercase (e.g., `route.ts`)
- Constants: UPPER_SNAKE_CASE

### Component Structure
```typescript
// Imports
import { ... } from '...'

// Types
type Props = { ... }

// Component
export function ComponentName({ props }: Props) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (...)
}
```

### API Route Structure
```typescript
import { NextRequest } from 'next/server'
import { requireApiPermission } from '@/lib/auth'
import { permissions } from '@/src/lib/permissions/permissions'

export async function GET(request: NextRequest) {
  // 1. Check permissions
  const { response } = await requireApiPermission(permissions.resourceRead)
  if (response) return response
  
  // 2. Validate input
  // 3. Business logic
  // 4. Return response
}
```

## Working with Database

### Creating Migrations
```bash
# After editing prisma/schema.prisma
npx prisma migrate dev --name description-of-change
```

### Accessing Database
```typescript
import { prisma } from '@/src/lib/db/prisma'

const users = await prisma.user.findMany()
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Note: npm install may be needed for test dependencies
```

## Common Tasks

### Adding a New API Endpoint
1. Create route file: `app/api/resource/route.ts`
2. Implement service logic: `src/services/resource/service.ts`
3. Add validation schema: `src/lib/validations/resource.ts`
4. Add permissions: `src/lib/permissions/permissions.ts`
5. Test endpoint manually or add tests

### Adding a New Page
1. Create page: `app/(protected)/page-name/page.tsx`
2. Add to navigation in `components/internal-app.tsx`
3. Add route protection in `middleware.ts` if needed

### Debugging
- Check console logs in browser dev tools
- Check server logs: `logs/combined.log`, `logs/error.log`
- Use Next.js error overlay in development
- Check database queries with Prisma debug: `DEBUG=prisma:query`

## Git Workflow

### Branch Strategy
- `main` - Production branch
- Feature branches: `feature/description`
- Bugfix branches: `fix/description`

### Commit Messages
```
feat: Add withdrawal validation
fix: Resolve authentication bug
docs: Update API documentation
chore: Update dependencies
```

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Run `npm run lint` and `npm run build`
4. Push and create PR
5. Wait for review and CI checks

## Need Help?

- Documentation: `docs/` directory
- API Reference: `docs/api/API-REFERENCE.md`
- Deployment: `docs/DEPLOYMENT.md`
- User Guide: `docs/USER-GUIDE.md`

## Contributing Guidelines

1. Follow code conventions
2. Write tests for new features
3. Update documentation
4. Ensure all checks pass before PR
5. Keep PRs focused and small

Welcome to the team! 🚀
