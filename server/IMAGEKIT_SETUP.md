# ImageKit Setup Guide

## Getting Started with ImageKit

ImageKit is a cloud-based image CDN service that provides image storage, optimization, and delivery. This project uses ImageKit for storing food and inventory item images.

### 1. Create an ImageKit Account

1. Go to [https://imagekit.io/](https://imagekit.io/)
2. Click "Sign Up" and create a free account
3. Complete the email verification

### 2. Get Your Credentials

After logging in to your ImageKit dashboard:

1. Click on **Settings** (gear icon) in the left sidebar
2. Navigate to **API Keys** section
3. You'll find three important values:
   - **Public Key** (e.g., `public_abc123...`)
   - **Private Key** (e.g., `private_xyz789...`) - Keep this secure!
   - **URL Endpoint** (e.g., `https://ik.imagekit.io/your_imagekit_id`)

### 3. Update Environment Variables

Open `server/.env` and replace the placeholder values:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY="your_actual_public_key_here"
IMAGEKIT_PRIVATE_KEY="your_actual_private_key_here"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_actual_imagekit_id"
MAX_FILE_SIZE=5242880
```

**Important:** Never commit your actual `.env` file with real credentials to version control!

### 4. Test the Integration

1. Restart your backend server:
   ```bash
   npm run server
   ```

2. You should see this message (without errors):
   ```
   🚀 Server running on port 5000
   ```

3. Try uploading an image through:
   - **Food Logs**: Add new log → Upload image
   - **Inventory**: Add new item → Upload image

### 5. Verify Upload in ImageKit Dashboard

1. Go to your ImageKit dashboard
2. Click **Media Library** in the left sidebar
3. Open the `/zerowaste` folder
4. You should see your uploaded images

## Features

### Image Upload Endpoints

- **POST** `/api/food-logs/upload` - Upload food log images
- **POST** `/api/inventory/upload` - Upload inventory item images

### File Limits

- **Max file size**: 5MB (configurable via `MAX_FILE_SIZE` in `.env`)
- **Allowed formats**: JPEG, JPG, PNG, WEBP
- **Storage location**: `/zerowaste` folder in ImageKit

### How It Works

1. User selects an image file in the frontend
2. Frontend sends multipart/form-data to backend endpoint
3. Backend uses **formidable** to parse the file
4. Backend uploads to ImageKit via ImageKit SDK
5. ImageKit returns a CDN URL (e.g., `https://ik.imagekit.io/xyz/zerowaste/123-image.jpg`)
6. Backend returns the URL to frontend
7. Frontend stores the URL in the database

### Fallback Behavior

If ImageKit upload fails (network issue, invalid credentials, etc.):
- Frontend falls back to **base64 data URIs**
- Images are stored directly in the database as base64 strings
- This ensures the app continues working even without ImageKit

## Troubleshooting

### Error: "ImageKit credentials not configured"

**Solution:** Check that your `.env` file has valid credentials:
```bash
# Verify credentials are set
grep IMAGEKIT server/.env
```

### Error: "Failed to upload image to ImageKit"

**Possible causes:**
1. Invalid API keys - Double-check your credentials
2. Network issues - Check your internet connection
3. File size too large - Ensure image is under 5MB
4. Invalid file format - Only JPEG, PNG, WEBP allowed

### Images not appearing in dashboard

1. Check the folder: Images are stored in `/zerowaste` folder
2. Verify public key matches your account
3. Ensure upload returned success (check browser console)

## Free Tier Limits

ImageKit free tier includes:
- ✅ 20GB bandwidth/month
- ✅ 20GB media storage
- ✅ Unlimited transformations
- ✅ 10,000 video seconds/month

This is more than enough for development and small production apps!

## Security Best Practices

1. ✅ **Never expose Private Key** - Keep it in `.env` and `.gitignore`
2. ✅ **Use server-side uploads** - Don't send private key to frontend
3. ✅ **Validate file types** - Backend checks image formats
4. ✅ **Limit file sizes** - Prevents abuse (5MB default)
5. ✅ **Use unique filenames** - Prevents overwrites (`timestamp-userId-filename`)

## Advanced Configuration

### Custom Folder Structure

Edit `server/src/services/imagekit.service.ts` line 33:

```typescript
folder: '/zerowaste/inventory', // Separate folder for inventory
folder: '/zerowaste/food-logs', // Separate folder for logs
```

### Image Transformations

ImageKit supports on-the-fly transformations. Add to image URLs:

```typescript
// Resize to 300x300
const thumbnailUrl = `${imageUrl}?tr=w-300,h-300`;

// Convert to WebP
const webpUrl = `${imageUrl}?tr=f-webp`;

// Multiple transformations
const optimized = `${imageUrl}?tr=w-500,h-500,f-webp,q-80`;
```

### Delete Images on Item Deletion

The service includes a `deleteImage()` method. To enable automatic deletion, update controllers:

```typescript
// In deleteInventoryItem
const item = await inventoryService.getById(id, userId);
if (item.imageUrl) {
  await imagekitService.deleteImage(item.imageUrl);
}
await inventoryService.delete(id, userId);
```

## Support

- **ImageKit Docs**: https://docs.imagekit.io/
- **API Reference**: https://docs.imagekit.io/api-reference/
- **Support**: support@imagekit.io
