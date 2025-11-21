import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import configuration
import { validateImageKitConfig } from './config/imagekit';

// Import routes
import authRoutes from './routes/auth.routes';
import inventoryRoutes from './routes/inventory.routes';
import foodLogRoutes from './routes/foodLog.routes';
import userRoutes from './routes/user.routes';
import resourceRoutes from './routes/resource.routes';
import foodDatabaseRoutes from './routes/foodDatabase.routes';
import categoryRoutes from './routes/category.routes';
import adminRoutes from './routes/admin.routes';
import communityRoutes from './routes/community.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Validate ImageKit configuration on startup
validateImageKitConfig();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting removed - no limits applied

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/food-logs', foodLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/food-database', foodDatabaseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export default app;
