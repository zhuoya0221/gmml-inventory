# Admin Guide - Categories & Locations Management

## Overview
As an admin, you now have the ability to manage categories and locations that are used throughout the inventory system. This allows for better organization and consistency in your inventory management.

## How to Access Admin Features

1. **Log in** to your account with admin privileges
2. **Navigate to Team Dashboard** 
3. **Click "Admin Panel"** button (only visible to admins)
4. **Choose the appropriate tab:**
   - **User Management**: Manage user roles (admin/member/user)
   - **Categories**: Manage inventory categories
   - **Locations**: Manage storage locations

## Managing Categories

### Add New Category
1. Go to **Categories** tab in Admin Panel
2. Click **"Add category"** button
3. Enter:
   - **Name**: Category name (required)
   - **Description**: Optional description
4. Click **"Add"** to save

### Edit Category
1. Find the category in the list
2. Click **"Edit"** 
3. Modify name or description
4. Click **"Update"** to save changes

### Delete Category
1. Find the category in the list
2. Click **"Delete"**
3. Confirm deletion
   - **Note**: Categories in use by inventory items cannot be deleted

## Managing Locations

### Add New Location
1. Go to **Locations** tab in Admin Panel
2. Click **"Add location"** button
3. Enter:
   - **Name**: Location name (required)
   - **Description**: Optional description
4. Click **"Add"** to save

### Edit Location
1. Find the location in the list
2. Click **"Edit"**
3. Modify name or description
4. Click **"Update"** to save changes

### Delete Location
1. Find the location in the list
2. Click **"Delete"**
3. Confirm deletion
   - **Note**: Locations in use by inventory items cannot be deleted

## How It Works

### Dynamic Forms
- **Add Item** and **Edit Item** forms now automatically show all available categories and locations
- **Filter options** are also dynamically updated based on your managed categories and locations
- Changes in admin panel are immediately reflected in all forms

### Default Data
The system comes pre-populated with categories and locations that match your existing inventory data:

**Categories:**
- Studying Consumables
- Stationery
- Others

**Locations:**
- GTR
- MD6 LEVEL9

### Database Setup
Before using these features, you need to set up the database tables and default data:

#### Option 1: Automatic Setup (Recommended)
Run this script in your Supabase SQL Editor:
```sql
-- File: add-categories-locations.sql
-- This will automatically find an admin user and create default data
```

#### Option 2: Manual Setup
If the automatic setup fails, use the manual version:

1. First, find your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

2. Copy your user ID and edit `add-categories-locations-manual.sql`
3. Replace all instances of `'YOUR_USER_ID_HERE'` with your actual user ID
4. Run the modified script in Supabase SQL Editor

#### Troubleshooting Database Setup
If you get a "null value in column 'created_by'" error:
- Make sure you have at least one user account created
- Use the manual setup option with your specific user ID
- Ensure your user has admin role in the profiles table

### Edge Functions
The system uses Supabase Edge Functions for secure category and location management:
- `manage-categories`: Handles CRUD operations for categories
- `manage-locations`: Handles CRUD operations for locations

These functions ensure only admins can modify categories and locations while allowing all authenticated users to view them.

## Security Notes

- Only users with **admin** role can add, edit, or delete categories and locations
- All users can **view** categories and locations in forms and filters
- Categories/locations in use by inventory items are **protected** from deletion
- All operations are logged and secured through Supabase RLS policies

## Troubleshooting

### Categories/Locations Not Showing
1. Ensure you're logged in with admin privileges
2. Check that the Supabase Edge Functions are deployed
3. Verify database tables were created correctly

### Cannot Delete Category/Location
This is expected behavior when the category/location is in use by inventory items. You must first:
1. Update all inventory items using that category/location
2. Then you can safely delete the unused category/location

### Forms Not Updating
- Refresh the page to reload the latest categories and locations
- Check browser console for any JavaScript errors
