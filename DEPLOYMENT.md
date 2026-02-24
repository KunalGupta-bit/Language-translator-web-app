# Deployment Guide: Vercel (Frontend) & Render (Backend)

## Overview
This guide walks you through deploying your Language Translator app with the frontend on Vercel and backend on Render.

---

## Part 1: Deploy Backend on Render

### Step 1: Prepare Your Repository
1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   - Create a new repository on [GitHub](https://github.com/new)
   - Push your code:
     ```bash
     git remote add origin https://github.com/YOUR_USERNAME/Language-translator-web-app.git
     git branch -M main
     git push -u origin main
     ```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com) and sign up/log in
2. Click **"New +"** → **"Web Service"**
3. **Connect your GitHub repository**:
   - Click "Connect account" and authorize GitHub
   - Select your `Language-translator-web-app` repository
4. **Configure the deployment**:
   - **Name**: `language-translator-backend` (or your choice)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free or Paid (free tier works fine for testing)

5. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add: `FLASK_ENV=production`

6. Click **"Create Web Service"**

### Step 3: Get Your Backend URL
- After deployment completes, Render will give you a URL like: `https://language-translator-backend.onrender.com`
- **Copy this URL** - you'll need it for the frontend

### Notes
- First deployment may take 2-3 minutes
- Render will auto-redeploy when you push to GitHub
- Free tier services spin down after 15 minutes of inactivity (no problem, they wake up on request)

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Prepare Environment Variable
1. In `/frontend/.env.example`, update:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   Replace with your actual Render backend URL

### Step 2: Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click **"Add New..."** → **"Project"**
3. **Import your GitHub repository**:
   - Click "Import Git Repository"
   - Select your `Language-translator-web-app` repository
4. **Configure the project**:
   - **Project Name**: `language-translator` (or your choice)
   - **Root Directory**: `./frontend`
   - **Framework**: Select `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables
In the "Environment Variables" section, add:
- **Name**: `VITE_API_URL`
- **Value**: `https://your-backend-url.onrender.com`
  (Use the URL from your Render deployment)

Click **"Add"**

### Step 4: Deploy
Click **"Deploy"** and wait for the build to complete (usually 1-2 minutes)

### Step 5: Get Your Frontend URL
- After deployment, Vercel will provide a URL like: `https://language-translator.vercel.app`
- Your app is now live!

---

## Part 3: Update CORS in Backend (if needed)

If you get CORS errors, the backend is already configured with:
```python
CORS(app, resources={r"/*": {"origins": ["*"]}})
```

This allows requests from anywhere. For production, you might want to restrict to your Vercel domain:
```python
CORS(app, resources={r"/*": {"origins": ["https://language-translator.vercel.app"]}})
```

---

## Testing Your Deployment

1. Go to your Vercel frontend URL
2. Test the translator functionality
3. Check the browser console (F12) for any errors
4. If you see API errors, verify:
   - Backend URL is correct in environment variable
   - Render backend is running (check Render dashboard)
   - CORS is properly configured

---

## Deployment Summary

| Component | Platform | URL Pattern |
|-----------|----------|------------|
| Frontend | Vercel | `https://your-project.vercel.app` |
| Backend | Render | `https://your-backend.onrender.com` |

---

## Useful Commands

**Local Testing:**
```bash
# Backend
python app.py

# Frontend  
cd frontend
npm run dev
```

**Environment Variables:**
- Frontend: Use `.env.local` for local development
- Backend: Set in Render dashboard

---

## Troubleshooting

### "Cannot find module" errors during build
- Make sure `npm run build` works locally first
- Check that all dependencies are in `package.json`

### CORS errors
- Verify `VITE_API_URL` is set in Vercel environment
- Check backend CORS configuration

### Blank page on Vercel
- Check browser console for errors
- Verify the build directory is `dist`

### Backend not responsive
- Check Render service status
- Look at Render logs for errors
- Verify all dependencies are in `requirements.txt`

---

## Next Steps (Optional)

- Add a custom domain to Vercel
- Set up monitoring on Render
- Add GitHub Actions for CI/CD
- Optimize production builds

