# GMML Inventory Setup Guide

Follow this step-by-step guide to get your inventory system running.

## 📋 Quick Setup Checklist

### ✅ 1. Supabase Project Setup

1. **Create Supabase Project**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for setup to complete (~2 minutes)

2. **Run Database Schema**
   - Open your project dashboard
   - Go to "SQL Editor" in the sidebar
   - Copy ALL contents from `database-schema.sql`
   - Paste and click "Run"
   - ✅ You should see "Success. No rows returned" message

3. **Get API Keys**
   - Go to Settings > API in sidebar
   - Copy the "Project URL" and "anon/public" key
   - Save these for step 4

### ✅ 2. Google OAuth Setup

1. **Google Cloud Console**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project or select existing
   - Project name suggestion: "GMML Inventory Auth"

2. **Enable APIs**
   - Go to "APIs & Services" > "Library"
   - Search "Google+ API" (or "Google Identity")
   - Click and "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name: "GMML Inventory"
   - **Authorized redirect URIs** (CRITICAL):
     ```
     https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
   - Replace `YOUR_SUPABASE_PROJECT_ID` with your actual project ID from Supabase URL

4. **Save Credentials**
   - Copy Client ID and Client Secret
   - Keep these for next step

### ✅ 3. Configure Supabase Authentication

1. **Enable Google Provider**
   - In Supabase dashboard: Authentication > Providers
   - Find "Google" and toggle it ON
   - Paste Client ID and Client Secret from step 2
   - Click "Save"

2. **Configure Site URL (Optional for production)**
   - Authentication > Settings > General
   - Set Site URL to your production domain when ready

### ✅ 4. Environment Variables

1. **Update .env.local**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Test Connection**
   - Run: `npm run dev`
   - Open: http://localhost:3000
   - You should see the login page

### ✅ 5. First Test

1. **Login Test**
   - Click "Sign in with Google"
   - Complete Google OAuth flow
   - You should be redirected to the inventory dashboard

2. **Add Test Item**
   - Click "Add Item"
   - Fill in required fields:
     - Name: "Test Laptop"
     - Category: "Electronics"
     - Storage Location: "Office A"
   - Click "Add Item"

3. **Verify Database**
   - Check Supabase dashboard > Table Editor
   - You should see the item in `inventory_items` table
   - Check `activity_logs` for the creation log

## 🚨 Common Issues & Solutions

### Issue: Google OAuth "redirect_uri_mismatch"
**Solution**: 
- Check Google Console authorized URIs match exactly
- No trailing slashes
- Use correct Supabase project URL

### Issue: "Failed to create item" 
**Solution**:
- Verify database schema was run completely
- Check Supabase logs in dashboard > Logs
- Ensure user is properly authenticated

### Issue: Environment variables not working
**Solution**:
- Restart dev server: `npm run dev`
- Check variable names (must start with `NEXT_PUBLIC_`)
- Verify no extra spaces in `.env.local`

### Issue: Can't see items after adding
**Solution**:
- Check browser console for errors
- Verify RLS policies in database
- Test in Supabase Table Editor

## 🎯 Production Deployment

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

### Google OAuth for Production
1. Add production domain to Google Console redirect URIs:
   ```
   https://yourapp.vercel.app/auth/callback
   ```
2. Update Supabase site URL to production domain

### Database Backups
- Supabase automatically backs up free tier projects
- Consider upgrading for more frequent backups in production

## 📞 Need Help?

1. **Check Browser Console** for JavaScript errors
2. **Check Supabase Logs** in dashboard
3. **Verify Database** using Table Editor
4. **Test Auth Flow** step by step

## 🎉 Success Indicators

✅ Can login with Google  
✅ Can add new inventory items  
✅ Can edit and delete items  
✅ Can see activity logs  
✅ Can export CSV  
✅ Search and filters work  

Your GMML Inventory System is ready to use! 🚀
