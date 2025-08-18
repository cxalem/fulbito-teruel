# Troubleshooting Admin Issues

If you're seeing "Solo los administradores pueden crear partidos" even though your email is in `ADMIN_EMAILS`, here's how to debug and fix it:

## Step 1: Check Environment Variables

1. **Verify your `.env.local` file exists and has the correct format:**
   ```bash
   # Your .env.local should look like this:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ADMIN_EMAILS=your-email@gmail.com,another@gmail.com
   ```

2. **Important notes:**
   - No spaces around the `=` sign
   - Your actual email address (the one you use to sign in with Google)
   - Multiple emails separated by commas (no spaces after commas)
   - The `SUPABASE_SERVICE_ROLE_KEY` is crucial for auto-enrollment

## Step 2: Restart the Server

After changing `.env.local`, you MUST restart the development server:

```bash
# Stop the server (Ctrl+C) and restart:
pnpm dev
```

## Step 3: Check the Debug Panel

1. Go to the home page (`http://localhost:3000`)
2. Look at the blue "Panel de Debug" 
3. It will show:
   - Your authentication status
   - Your admin status
   - Your email address
   - Environment variable info

## Step 4: Sign Out and Sign In Again

If you were already signed in:
1. Click "Cerrar sesión" 
2. Sign in again with "Iniciar sesión con Google"
3. This will trigger the auto-enrollment process

## Step 5: Check Server Logs

Look at your terminal where `pnpm dev` is running. You should see logs like:

```
Checking admin emails: ['your-email@gmail.com']
User email: your-email@gmail.com
Auto-enrolled admin: your-email@gmail.com
```

If you see "User email not in admin list", your email doesn't match exactly.

## Step 6: Manual Database Check

If the issue persists, check your Supabase database directly:

1. Go to your Supabase dashboard
2. Go to Table Editor → `admins` table
3. Check if your user ID is there
4. If not, the auto-enrollment failed

## Common Issues

### Issue: "User email not in admin list"
- **Cause**: Email in `ADMIN_EMAILS` doesn't match your Google account email exactly
- **Fix**: Use the exact email shown in the debug panel

### Issue: "Error enrolling admin"
- **Cause**: Missing or incorrect `SUPABASE_SERVICE_ROLE_KEY`
- **Fix**: Copy the service role key from Supabase Settings → API

### Issue: Still not admin after sign-in
- **Cause**: Server didn't restart after changing `.env.local`
- **Fix**: Stop server (Ctrl+C) and run `pnpm dev` again

### Issue: Environment variables not loading
- **Cause**: `.env.local` file not in project root or wrong format
- **Fix**: Ensure file is in `/Users/cxalem/projects/fulbito-teruel/.env.local`

## Quick Fix Command

Run this to check if your environment is set up correctly:

```bash
# Check if .env.local exists
ls -la .env.local

# Check if it has the right variables (without showing values)
grep -E "^(ADMIN_EMAILS|SUPABASE_SERVICE_ROLE_KEY)=" .env.local
```

## Still Having Issues?

1. Check the browser console for any JavaScript errors
2. Check the server terminal for any error messages
3. Verify your Supabase project is set up correctly
4. Make sure you've run all the SQL commands from `prompt.md`

The debug panel on the home page will give you the most useful information for troubleshooting!
