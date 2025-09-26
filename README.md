# GMML Inventory Management System

A modern, full-featured inventory management system built with Next.js and Supabase. Features Google OAuth authentication, real-time updates, activity logging, and CSV import/export capabilities.

## Features

- **Authentication**: Google OAuth integration with Supabase
- **Inventory Management**: Full CRUD operations for inventory items
- **Real-time Updates**: Live updates using Supabase real-time subscriptions
- **Search & Filtering**: Search by name and filter by category, location, and status
- **Activity Logging**: Track all changes with detailed audit logs
- **CSV Export/Import**: Export inventory data and import bulk updates
- **Stock Status Tracking**: Automatic status updates (In Stock, Low Stock, Out of Stock)
- **Photo Support**: Add item photos via URL
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Authentication**: Supabase Auth with Google OAuth
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks and local state
- **Styling**: Tailwind CSS with custom components

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Console project (for OAuth)

### 2. Clone and Install

```bash
cd gmml-inventory
npm install
```

### 3. Supabase Setup

1. **Create a new Supabase project** at [https://app.supabase.com](https://app.supabase.com)

2. **Run the database schema**: Copy the contents of `database-schema.sql` and run it in your Supabase SQL Editor

3. **Configure Authentication**:
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable Google provider
   - Add your Google OAuth credentials (see step 4)

4. **Get your environment variables**:
   - Go to Settings > API in your Supabase dashboard
   - Copy the Project URL and anon public key

### 4. Google OAuth Setup

1. **Create a Google Cloud Console project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it

3. **Create OAuth credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

4. **Configure in Supabase**:
   - Copy the Client ID and Client Secret
   - Go to Authentication > Settings > Auth Providers in Supabase
   - Enable Google and add your credentials

### 5. Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **profiles**: User profile information
- **inventory_items**: Main inventory data
- **activity_logs**: Audit trail for all changes

Key features of the schema:
- Row Level Security (RLS) enabled
- Automatic status updates based on stock levels
- Activity logging triggers
- Indexes for optimal search performance

## Usage

### Adding Items

1. Click the "Add Item" button
2. Fill in the required fields (name, category, storage location)
3. Optionally add current stock, minimum stock, and photo URL
4. Click "Add Item" to save

### Managing Inventory

- **Search**: Use the search bar to find items by name
- **Filter**: Use dropdown filters for category, location, and status
- **Edit**: Click the edit icon in the actions column
- **Delete**: Click the delete icon (requires confirmation)

### Activity Tracking

- Click "Activity Log" to view all changes
- See who made changes and when
- View detailed change information

### CSV Export

- Click "Export CSV" to download current filtered data
- Includes all visible columns in CSV format

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted

## Customization

### Adding New Categories

Edit the category options in:
- `src/components/AddItemModal.tsx`
- `src/components/EditItemModal.tsx`

### Modifying Status Logic

Update the status calculation in the database trigger function in `database-schema.sql`.

### UI Customization

The UI uses Tailwind CSS. Modify the styles in component files or update the Tailwind configuration.

## Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Verify Google OAuth credentials
   - Check redirect URIs match exactly
   - Ensure Supabase project is configured correctly

2. **Database errors**:
   - Verify the schema was run completely
   - Check RLS policies are enabled
   - Ensure user has proper permissions

3. **Build errors**:
   - Check all environment variables are set
   - Verify Node.js version compatibility
   - Clear `.next` directory and reinstall dependencies

### Support

For issues or questions:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify environment variables are correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.