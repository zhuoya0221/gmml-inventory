# 🚀 GitHub Pages Deployment Guide for GMML Inventory System

This guide will help you deploy your Next.js inventory management system to GitHub Pages, making it accessible to the public.

## 📋 Prerequisites

- ✅ Your project is already on GitHub
- ✅ You have a GitHub account
- ✅ Node.js and npm are installed
- ✅ Git is configured

## 🛠️ Step 1: Prepare Your Project for Static Export

Since GitHub Pages serves static files and your app uses Supabase (which requires server-side features), we need to configure it for static export with client-side only functionality.

### 1.1 Update Next.js Configuration

Create or update `next.config.js` in your project root:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig
```

### 1.2 Update Package.json Scripts

Add the export script to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export",
    "deploy": "npm run build && touch out/.nojekyll && git add out/ && git commit -m 'Deploy to GitHub Pages' && git subtree push --prefix out origin gh-pages"
  }
}
```

## 🔧 Step 2: Configure GitHub Pages

### 2.1 Create GitHub Pages Branch

Run these commands in your terminal:

```bash
# Navigate to your project directory
cd /Users/nuhibd/Desktop/Web/gmml-inventory

# Create a new branch for GitHub Pages
git checkout --orphan gh-pages

# Remove all files from the new branch
git rm -rf .

# Go back to main branch
git checkout main
```

### 2.2 Build and Deploy

```bash
# Build the static site
npm run build

# Create the out directory if it doesn't exist
mkdir -p out

# Copy the built files to out directory
cp -r .next/out/* out/

# Create .nojekyll file (prevents Jekyll processing)
touch out/.nojekyll

# Add and commit the built files
git add out/
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git subtree push --prefix out origin gh-pages
```

## ⚙️ Step 3: Configure GitHub Repository Settings

### 3.1 Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Select **gh-pages** branch and **/ (root)** folder
6. Click **Save**

### 3.2 Set Up Actions for Automatic Deployment (Recommended)

Create `.github/workflows/deploy.yml` in your project:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

## 🔐 Step 4: Configure Environment Variables for Production

### 4.1 Update Supabase Configuration

Since static sites can't use server-side environment variables, you'll need to:

1. Go to your Supabase project settings
2. Add your production domain to **Site URL**:
   - `https://yourusername.github.io/gmml-inventory/`
3. Add your domain to **Redirect URLs**:
   - `https://yourusername.github.io/gmml-inventory/auth/callback`

### 4.2 Update Environment Variables

Update your `.env.local` to include production URLs:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://yourusername.github.io/gmml-inventory
```

## 📝 Step 5: Manual Deployment Commands

If you prefer manual deployment, use these commands:

```bash
# Navigate to project directory
cd /Users/nuhibd/Desktop/Web/gmml-inventory

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🌐 Step 6: Access Your Public Website

After deployment, your website will be available at:
- `https://yourusername.github.io/gmml-inventory/`

Replace `yourusername` with your actual GitHub username.

## 🔄 Step 7: Update Your Database

### 7.1 Run the SQL Script

Don't forget to update your Supabase database with the new categories:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the `update-exact-categories.sql` script
4. This will add all your study consumables and stationery items

## 🚨 Important Notes

### Limitations of Static Deployment:

1. **Authentication**: Google OAuth will work but requires proper redirect URL configuration
2. **Database**: Supabase will work normally (it's client-side)
3. **Server Actions**: Any server-side API routes won't work
4. **Real-time**: WebSocket connections may have limitations

### Troubleshooting:

1. **404 Errors**: Make sure `trailingSlash: true` is set in next.config.js
2. **OAuth Issues**: Verify redirect URLs in both Google Console and Supabase
3. **Build Errors**: Check that all imports are compatible with static export
4. **Styling Issues**: Ensure CSS is properly bundled

## 🔧 Alternative: Vercel Deployment (Recommended for Next.js)

If you encounter issues with GitHub Pages, consider using Vercel (free):

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Deploy automatically

Vercel supports Next.js server-side features better than GitHub Pages.

## 📞 Support

If you encounter any issues:
1. Check the GitHub Actions logs
2. Verify environment variables
3. Ensure Supabase configuration is correct
4. Check browser console for errors

---

**Your GMML Inventory System will be live at: `https://yourusername.github.io/gmml-inventory/`** 🎉
