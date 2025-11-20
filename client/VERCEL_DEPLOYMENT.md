# ZeroWaste Frontend - Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket

## Quick Deployment Steps

### 1. Push Your Code to Git
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your repository (authorize GitHub/GitLab access if needed)
4. Select the `ZeroWaste` repository
5. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (auto-configured)
   - **Output Directory**: `.next` (auto-configured)

6. **Add Environment Variables** (CRITICAL):
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com/api`
   - (Replace with your actual backend URL once deployed)

7. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to client directory
cd client

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? zerowaste-frontend (or your choice)
# - Directory? ./ (current directory)
# - Want to modify settings? No

# For production deployment:
vercel --prod
```

### 3. Configure Environment Variables (Post-Deployment)

After deploying, configure your production environment variable:

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add/Update:
   - **Variable**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your production backend API URL (e.g., `https://api.zerowaste.com/api`)
   - **Environment**: Production, Preview, Development (select all)

4. **Redeploy** after adding variables:
   - Go to "Deployments" tab
   - Click "..." on latest deployment → "Redeploy"

## Important Configuration Files Created

✅ `client/.gitignore` - Excludes sensitive files and build artifacts
✅ `client/vercel.json` - Vercel deployment configuration
✅ `next.config.mjs` - Updated with production optimizations and ImageKit support

## Post-Deployment Checklist

- [ ] Verify deployment at your Vercel URL (e.g., `zerowaste-frontend.vercel.app`)
- [ ] Test that the landing page loads correctly
- [ ] Ensure `NEXT_PUBLIC_API_URL` is set to your backend URL
- [ ] Test API connectivity once backend is deployed
- [ ] Configure custom domain (optional):
  - Go to Settings → Domains
  - Add your custom domain
  - Update DNS records as instructed

## Connecting to Backend

Your backend needs to be deployed separately. Options:
1. **Railway** - https://railway.app (Node.js + PostgreSQL)
2. **Render** - https://render.com (Free tier available)
3. **Heroku** - https://heroku.com
4. **AWS/Azure/GCP** - Enterprise solutions

Once backend is deployed:
1. Get the backend API URL (e.g., `https://zerowaste-api.railway.app/api`)
2. Update `NEXT_PUBLIC_API_URL` in Vercel environment variables
3. Redeploy the frontend

## CORS Configuration Reminder

Your backend `.env` must include the Vercel URL:
```env
FRONTEND_URL="https://your-vercel-url.vercel.app"
```

Update `server/src/server.ts` CORS configuration to allow your Vercel domain.

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches or pull requests

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript/ESLint errors locally first

### Environment Variables Not Working
- Variables must be prefixed with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy after adding/changing variables

### API Calls Failing
- Check browser console for CORS errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Ensure backend allows Vercel domain in CORS

## Monitoring & Analytics

Vercel provides:
- **Analytics**: Settings → Analytics (may require upgrade)
- **Logs**: Deployment logs for debugging
- **Performance**: Web Vitals monitoring

## Cost

- **Hobby Plan** (Free): Perfect for personal projects
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic SSL

- **Pro Plan** ($20/month): For production apps
  - Advanced analytics
  - Team collaboration
  - Priority support

## Next Steps

1. Deploy your backend API (see backend README)
2. Update `NEXT_PUBLIC_API_URL` with production backend URL
3. Test the full application flow
4. Configure custom domain (optional)
5. Set up monitoring and error tracking (e.g., Sentry)

---

**Your frontend is now configured for Vercel deployment!** 🚀
