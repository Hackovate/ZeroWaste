# ZeroWaste Backend

Express + Prisma + PostgreSQL backend for ZeroWaste food management app.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL credentials
   - Update `JWT_SECRET` with a secure random string

3. **Setup database:**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start development server:**
   ```bash
   npm run server
   ```

## Available Scripts

- `npm run server` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm run prisma:push` - Push schema changes (dev only)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create inventory item
- `PATCH /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `GET /api/inventory/stats` - Get inventory statistics

### Food Logs
- `GET /api/food-logs` - Get all food logs
- `POST /api/food-logs` - Create food log
- `DELETE /api/food-logs/:id` - Delete food log
- `POST /api/food-logs/upload` - Upload food image

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update user profile

### Resources
- `GET /api/resources` - Get educational resources

## Project Structure

```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── middleware/      # Auth, validation, error handling
│   ├── validators/      # Zod schemas
│   ├── config/          # Database, Multer config
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── uploads/             # File storage (gitignored)
```

## Technologies

- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Argon2** - Password hashing
- **JWT** - Authentication
- **Zod** - Validation
- **Multer** - File upload
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
