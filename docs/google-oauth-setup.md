# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for Fulbito Teruel.

## Step 1: Configure Supabase Auth

1. **Go to your Supabase project dashboard**
   - Navigate to `Authentication` → `Providers`
   - Find `Google` and toggle it ON

2. **Configure Google Provider Settings**
   - You'll need to add your Google OAuth credentials
   - Note the callback URL: `https://your-project-id.supabase.co/auth/v1/callback`

## Step 2: Create Google OAuth App

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to `APIs & Services` → `Library`
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to `APIs & Services` → `Credentials`
   - Click `Create Credentials` → `OAuth 2.0 Client IDs`
   - Choose `Web application`

4. **Configure OAuth Client**
   - **Name**: Fulbito Teruel
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - Your production domain (when deployed)
   - **Authorized redirect URIs**:
     - `https://your-project-id.supabase.co/auth/v1/callback`

5. **Copy Credentials**
   - Copy the `Client ID` and `Client Secret`

## Step 3: Configure Supabase

1. **Back in Supabase Dashboard**
   - Go to `Authentication` → `Providers` → `Google`
   - Paste your `Client ID` and `Client Secret`
   - Save the configuration

## Step 4: Update Environment Variables

Add your admin email to `.env.local`:

```bash
# Add your email to test admin functionality
ADMIN_EMAILS=your-email@gmail.com,another-admin@gmail.com
```

## Step 5: Test Authentication

1. **Start the development server**
   ```bash
   pnpm dev
   ```

2. **Test the flow**
   - Click "Iniciar sesión con Google" in the navbar
   - Complete Google OAuth flow
   - You should be redirected back to the app
   - If your email is in `ADMIN_EMAILS`, you'll see "Administrador" badge

## Step 6: Test RLS Policies

1. **As Admin**
   - Use the "Panel de Prueba de RLS" on the home page
   - Click "Crear Partido de Prueba" - should succeed
   - You'll see a green panel indicating admin status

2. **As Regular User**
   - Use an email NOT in `ADMIN_EMAILS`
   - The panel will be red and show "Usuario Normal"
   - Attempting to create a match should fail with proper error message

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the redirect URI in Google Console exactly matches your Supabase callback URL
- Check for trailing slashes and http vs https

### "access_denied" Error
- The user canceled the OAuth flow
- Try again with a different Google account

### Admin Badge Not Showing
- Check that your email is correctly listed in `ADMIN_EMAILS`
- Check the browser console for any errors
- Verify the user was inserted into the `admins` table

### RLS Policy Errors
- Ensure you've run all the SQL commands from `prompt.md`
- Check that the `admins` table exists and has proper RLS policies
- Verify your user ID exists in the `admins` table

## Security Notes

- Never commit your Google OAuth credentials to version control
- Use environment variables for all sensitive data
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- Regular users cannot see or modify admin-only data due to RLS policies
