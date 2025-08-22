# Supabase Setup Guide

This project is now integrated with Supabase for authentication and database functionality.

## Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project dashboard
# https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/settings/api

VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Setting up Supabase

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created

2. **Get Your Project Credentials:**
   - In your Supabase dashboard, go to Settings → API
   - Copy the "Project URL" (this is your `VITE_SUPABASE_URL`)
   - Copy the "anon public" key (this is your `VITE_SUPABASE_ANON_KEY`)

3. **Configure Authentication:**
   - Go to Authentication → Settings
   - Under "Site URL", add your local development URL (e.g., `http://localhost:5173`)
   - Under "Redirect URLs", add your local development URL with auth callback (e.g., `http://localhost:5173/auth/callback`)

4. **Enable Email Authentication:**
   - Go to Authentication → Providers
   - Make sure "Email" is enabled
   - Configure email templates if needed

## Features Included

- ✅ User registration and login
- ✅ Email/password authentication
- ✅ Protected routes
- ✅ User session management
- ✅ Logout functionality
- ✅ Responsive UI components
- ✅ Loading states and error handling

## Available Routes

- `/` - Home page with authentication status
- `/auth` - Authentication page (login/signup)
- `/dashboard` - Protected dashboard (requires authentication)

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`

3. Click "Sign In / Sign Up" to access the authentication page

4. Create an account or sign in with existing credentials

5. Access the protected dashboard

## Next Steps

You can now:
- Add more protected routes
- Create database tables in Supabase
- Add real-time subscriptions
- Implement user profiles
- Add social authentication providers

## Troubleshooting

- Make sure your environment variables are correctly set
- Check that your Supabase project is active
- Verify that email authentication is enabled in your Supabase dashboard
- Check the browser console for any error messages
