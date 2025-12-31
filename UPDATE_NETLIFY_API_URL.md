# Update Netlify API URL

Your frontend needs to point to your new App Runner service URL.

## Your New Backend URL

**App Runner Service URL:** `https://ss24uxbrbt.us-west-2.awsapprunner.com`

## Steps to Update Netlify

1. **Go to Netlify Dashboard:**

   - Visit: https://app.netlify.com
   - Sign in to your account

2. **Select Your Site:**

   - Find your `batorbattle` site (or whatever you named it)
   - Click on it

3. **Navigate to Environment Variables:**

   - Click **"Site configuration"** (or **"Site settings"**)
   - In the left sidebar, click **"Environment variables"**
   - Or go directly to: `https://app.netlify.com/sites/YOUR_SITE_NAME/configuration/env`

4. **Update the API_URL Variable:**

   - Find the `API_URL` variable in the list
   - Click **"Edit"** (or the pencil icon)
   - **Update the value to:** `https://ss24uxbrbt.us-west-2.awsapprunner.com`
   - Click **"Save"**

   **OR if it doesn't exist:**

   - Click **"Add variable"**
   - **Key:** `API_URL`
   - **Value:** `https://ss24uxbrbt.us-west-2.awsapprunner.com`
   - Click **"Save"**

5. **Trigger a New Build:**
   - After updating the environment variable, you need to trigger a new deployment
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**
   - Or make a small change and push to your repository

## Verify It Works

After the new build completes:

1. **Open your site in a browser**
2. **Open browser console** (F12 or right-click → Inspect → Console)
3. **Check the API URL:**

   ```javascript
   console.log(window.APP_CONFIG.API_URL);
   ```

   Should show: `https://ss24uxbrbt.us-west-2.awsapprunner.com`

4. **Test the connection:**
   - Try using your app
   - Check the Network tab to see if API calls are going to the correct URL
   - Should see requests to `https://ss24uxbrbt.us-west-2.awsapprunner.com/api/getToken`

## Quick Reference

- **Netlify Dashboard:** https://app.netlify.com
- **Environment Variables:** Site settings → Environment variables
- **New API URL:** `https://ss24uxbrbt.us-west-2.awsapprunner.com`

---

## Alternative: Update via Netlify CLI

If you have Netlify CLI installed:

```bash
# Set the environment variable
netlify env:set API_URL https://ss24uxbrbt.us-west-2.awsapprunner.com

# Trigger a new build
netlify deploy --prod
```
