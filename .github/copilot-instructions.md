# ZeroWaste - AI Coding Agent Instructions

## Project Overview
**ZeroWaste** is a Next.js 15 food waste management web app helping users track food inventory, log consumption, and access sustainability resources.

- **Frontend:** Next.js 15 + React, shadcn/ui, Tailwind CSS v4
- **Backend:** Express + Prisma + PostgreSQL (MVC architecture)
- **Current State:** Frontend uses localStorage; backend migration in progress

---

## Frontend Architecture

### State Management
- **Single Context:** `client/src/lib/AppContext.tsx` provides global state via React Context
- **localStorage persistence:** All state (users, foodLogs, inventory, categories) auto-syncs to localStorage on every change
- **No external APIs (yet):** Image uploads use FileReader to convert to base64 data URIs
- Access state via: `const { currentUser, inventory, addFoodLog } = useApp()`

### Navigation & Layout
- **Client-side routing:** View switching handled by state (`currentView`) in `app/page.tsx`
- **Three-tier layout:** `TopBar` (always visible) + `AppSidebar` (collapsible) + dynamic content area
- **Auth flow:** LandingPage → Login → Onboarding → Dashboard
- Views: `dashboard`, `logs`, `inventory`, `resources`, `profile`

### Component Organization
```
client/src/components/
├── ui/              # shadcn/ui primitives (button, card, dialog, etc.)
├── figma/           # Figma-specific utilities (ImageWithFallback)
├── Dashboard.tsx    # Main views (top-level pages)
├── AppSidebar.tsx   # Layout components
└── TopBar.tsx
```

### Styling
- **Tailwind v4 CSS variables:** Use `bg-primary`, `text-(--color-700)`, `var(--radius)` from `styles/globals.css`
- **Primary color:** `#F55951` (red/coral) for branding
- **Dark mode:** Supported via `.dark` class and CSS custom properties
- **Utility merge:** Use `cn()` from `components/ui/utils.ts` for conditional classes
- **Responsive:** Mobile-first with `md:`, `lg:` breakpoints

### Component Patterns
- **Form notifications:** Use `toast` from `sonner` library (already configured in layout)
  ```tsx
  import { toast } from 'sonner';
  toast.success('Item added!');
  toast.error('Invalid input');
  ```
- **Icons:** lucide-react (e.g., `<Package className="w-4 h-4" />`)
- **Image handling:** Prefer `ImageWithFallback` for external images to show placeholder on error

---

## Backend Architecture (MVC Pattern)

### Tech Stack
- **Runtime:** Node.js + Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (jsonwebtoken) + Argon2 (password hashing)
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, express-rate-limit
- **File Upload:** Multer (for images)

### Directory Structure
```
server/
├── src/
│   ├── controllers/     # Request handlers (business logic)
│   ├── models/          # Prisma schema (prisma/schema.prisma)
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth, validation, error handling
│   ├── services/        # Business logic layer
│   ├── utils/           # Helpers (token generation, etc.)
│   ├── validators/      # Zod validation schemas
│   ├── config/          # DB, environment config
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # Multer file storage (gitignored)
└── .env                 # Environment variables
```

### MVC Pattern Guidelines

**Controllers** (`src/controllers/*.controller.ts`)
```typescript
// Handle HTTP requests, call services, return responses
export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const validated = itemSchema.parse(req.body);
    const item = await inventoryService.create(validated, req.user.id);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error); // Pass to error middleware
  }
};
```

**Services** (`src/services/*.service.ts`)
```typescript
// Business logic, interact with Prisma
export const inventoryService = {
  async create(data: CreateItemDTO, userId: string) {
    return await prisma.inventoryItem.create({
      data: { ...data, userId }
    });
  }
};
```

**Routes** (`src/routes/*.routes.ts`)
```typescript
import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { itemSchema } from '@/validators/inventory.validator';

const router = Router();
router.post('/', authenticate, validateRequest(itemSchema), createInventoryItem);
```

### Key Conventions

**Prisma Schema** (`prisma/schema.prisma`)
```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  passwordHash          String
  name                  String
  householdSize         Int      @default(1)
  dietaryPreferences    String[] // Array of strings
  district              String?
  division              String?
  onboardingCompleted   Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  inventory             InventoryItem[]
  foodLogs              FoodLog[]
}

model InventoryItem {
  id                  String   @id @default(cuid())
  name                String
  category            String   // dairy, grain, fruit, vegetable, protein, oil
  quantity            Float
  unit                String   // kg, gm, ltr, pcs
  expirationEstimate  Int      // days
  price               Float?
  dateAdded           DateTime @default(now())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Authentication Middleware** (`src/middleware/auth.ts`)
```typescript
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Validation Middleware** (`src/middleware/validation.ts`)
```typescript
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  };
};
```

**Zod Validators** (`src/validators/*.validator.ts`)
```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['dairy', 'grain', 'fruit', 'vegetable', 'protein', 'oil']),
  quantity: z.number().positive(),
  unit: z.enum(['kg', 'gm', 'ltr', 'pcs']),
  expirationEstimate: z.number().int().positive(),
  price: z.number().positive().optional()
});
```

**Error Handling** (`src/middleware/errorHandler.ts`)
```typescript
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  
  res.status(500).json({ error: 'Internal server error' });
};
```

### Security Setup (`src/server.ts`)
```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### File Upload with Multer (`src/config/multer.ts`)
```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/images/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, isValid);
  }
});
```

### Environment Variables (`.env`)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zerowaste"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Backend Commands
```bash
# Development
npm run server           # Start dev server with nodemon
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled production build

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:push      # Push schema to DB (no migration files)
npm run prisma:studio    # Open Prisma Studio GUI
```

---

## Data Models (Shared Contract)

```typescript
// Match these across frontend (client/src/lib/data.ts) and backend (prisma/schema.prisma)

User: {
  id: string (cuid)
  name: string
  email: string (unique)
  householdSize: number
  dietaryPreferences: string[]
  location: { district: string, division: string }
  onboardingCompleted: boolean
}

InventoryItem: {
  id: string (cuid)
  name: string
  category: 'dairy' | 'grain' | 'fruit' | 'vegetable' | 'protein' | 'oil'
  quantity: number
  unit: 'kg' | 'gm' | 'ltr' | 'pcs'
  dateAdded: string (ISO 8601)
  expirationEstimate: number (days)
  price?: number
  userId: string (foreign key)
}

FoodLog: {
  id: string (cuid)
  itemName: string
  quantity: number
  unit: 'kg' | 'gm' | 'ltr' | 'pcs'
  category: string
  date: string (ISO 8601)
  imageUrl?: string
  userId: string (foreign key)
}
```

---

## Frontend-Backend Integration

### API Client Setup (`client/src/lib/apiClient.ts`)
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### Replace AppContext with API Calls
```typescript
// Before (localStorage):
const addInventoryItem = (item) => {
  const newItem = { ...item, id: Date.now().toString() };
  setInventory([...inventory, newItem]);
};

// After (API):
const addInventoryItem = async (item) => {
  try {
    const { data } = await api.post('/inventory', item);
    setInventory([...inventory, data.data]);
    toast.success('Item added!');
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to add item');
  }
};
```

---

## Common Tasks

### Adding a New Backend Feature
1. **Define Prisma model** in `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. **Create Zod validator** in `src/validators/`
4. **Create service** in `src/services/` (Prisma interactions)
5. **Create controller** in `src/controllers/` (HTTP handling)
6. **Create routes** in `src/routes/` (wire it all together)
7. **Update frontend** API calls in `AppContext` or new hooks

### Adding a New View (Frontend)
1. Create component in `client/src/components/YourView.tsx`
2. Add nav item to `AppSidebar.tsx` and `TopBar.tsx` (if needed)
3. Update switch statement in `app/page.tsx` `renderView()`
4. Use `onNavigate` prop to switch views: `onNavigate('your-view')`

---

## Development Workflow

### Frontend (client/)
```bash
npm run dev    # Next.js dev server (http://localhost:3000)
npm run build  # Production build
npm run lint   # ESLint check
```

### Backend (server/)
```bash
npm run server           # Start Express dev server (http://localhost:5000)
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Apply schema changes
```

### Path Aliases
- **Frontend:** `@/*` maps to `client/src/*`
- **Backend:** Use relative imports or configure tsconfig paths

---

## Critical Constraints & Migration Notes

- **Password Security:** Use Argon2 for hashing (NOT bcrypt) - better security
- **File Storage:** Multer saves to `server/uploads/` (add to `.gitignore`)
- **Image URLs:** Backend returns `/uploads/images/filename.jpg`, frontend uses `${API_URL}/uploads/...`
- **localStorage Migration:** Keep localStorage as fallback during development; gradually replace with API calls
- **CORS:** Ensure `FRONTEND_URL` in `.env` matches Next.js dev server
- **Prisma Migrations:** Always run migrations before deploying - don't use `prisma db push` in production

---

## Security Checklist

✅ Use Helmet for security headers  
✅ Argon2 for password hashing (not bcrypt)  
✅ JWT with secure, rotating secrets  
✅ Rate limiting on all API routes  
✅ Zod validation on all inputs  
✅ CORS restricted to frontend domain  
✅ File upload validation (type, size)  
✅ SQL injection prevention (Prisma handles this)  
✅ Environment variables for secrets  
✅ HTTPS in production  

---

## Resources
- [Prisma Docs](https://www.prisma.io/docs)
- [Zod Validation](https://zod.dev)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [shadcn/ui Components](https://ui.shadcn.com)
