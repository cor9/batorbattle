# Custom Domain Setup: batorbattle.space

This guide covers setting up custom domains for:
- **Frontend (Netlify)**: `batorbattle.space` - Main website
- **Backend (AWS App Runner)**: `api.batorbattle.space` - API server

## Frontend (Netlify) - batorbattle.space

### 1. Add Domain in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Domain management**
3. Click **Add custom domain**
4. Enter: `batorbattle.space`
5. Click **Verify**

### 2. Configure DNS

Netlify will provide DNS configuration. You need to add these DNS records to your domain registrar:

**Option A: Netlify DNS (Recommended)**

- Use Netlify's nameservers (provided in Netlify dashboard)
- Update nameservers at your domain registrar

**Option B: External DNS**
Add these records at your DNS provider:

- **A Record**: `@` → Netlify IP (provided by Netlify)
- **CNAME Record**: `www` → `your-site.netlify.app`

### 3. SSL Certificate

- Netlify automatically provisions SSL via Let's Encrypt
- Wait 5-10 minutes for certificate to be issued
- HTTPS will be enabled automatically

### 4. Update Environment Variables

In Netlify dashboard:

- Go to **Site settings** > **Environment variables**
- Update `API_URL` if your backend has a custom domain
- Or keep it as your App Runner URL

## Backend (AWS App Runner) - api.batorbattle.space

**Domain Structure:**
- Frontend: `https://batorbattle.space` (Netlify)
- Backend: `https://api.batorbattle.space` (AWS App Runner)

### Step 1: Add Custom Domain in AWS App Runner

1. **Go to AWS App Runner Console**
   - Navigate to: https://console.aws.amazon.com/apprunner
   - Select your service (e.g., `bator-battle-backend`)

2. **Add Custom Domain**
   - Click on your service name
   - Go to the **Custom domains** tab
   - Click **Add domain**
   - Enter: `api.batorbattle.space`
   - Click **Add**

3. **AWS will provide DNS configuration**
   - You'll see a CNAME record that needs to be added
   - Example: `api.batorbattle.space` → `xxxxx.us-east-1.awsapprunner.com`
   - **Copy this CNAME record** - you'll need it for DNS configuration

### Step 2: Configure DNS for Backend

At your domain registrar (where you bought `batorbattle.space`), add:

**CNAME Record:**
- **Name/Host**: `api`
- **Value/Target**: `xxxxx.us-east-1.awsapprunner.com` (the value AWS provided)
- **TTL**: 3600 (or default)

**Note**: If your registrar doesn't support CNAME at the root, you'll need to use the subdomain `api.batorbattle.space`.

### Step 3: Wait for DNS Propagation

- DNS changes can take 1-48 hours (usually 1-2 hours)
- AWS will automatically provision SSL certificate once DNS is verified
- Check status in App Runner console - it will show "Pending" then "Active"

### Step 4: Update Environment Variables

After the custom domain is active, update your App Runner service:

1. Go to your App Runner service
2. Click **Configuration** tab
3. Click **Edit** next to Environment variables
4. Update `CORS_ORIGIN` to include the backend domain:
   ```
   CORS_ORIGIN=https://batorbattle.space,https://www.batorbattle.space,https://api.batorbattle.space
   ```
5. Save and wait for redeployment

### Step 5: Update Frontend API URL

In Netlify dashboard:

1. Go to **Site settings** > **Environment variables**
2. Update `API_URL` to:
   ```
   API_URL=https://api.batorbattle.space
   ```
3. Trigger a new deploy (or it will auto-deploy if connected to git)

### Alternative: Use App Runner Default URL

If you prefer to keep the App Runner default URL:
- No DNS configuration needed
- Just ensure `CORS_ORIGIN` includes `https://batorbattle.space`
- Update Netlify `API_URL` to your App Runner service URL

## Update CORS Configuration

### In AWS App Runner Environment Variables:

```
CORS_ORIGIN=https://batorbattle.space,https://www.batorbattle.space
```

Or if using backend custom domain:

```
CORS_ORIGIN=https://batorbattle.space,https://www.batorbattle.space,https://api.batorbattle.space
```

### In .env file (for local development):

```
CORS_ORIGIN=https://batorbattle.space,http://localhost:8181
```

## DNS Records Summary

At your domain registrar (where you bought batorbattle.space), add:

### For Netlify (Frontend):

- **A Record**: `@` → Netlify IP address
- **CNAME**: `www` → `your-site.netlify.app`
- Or use Netlify nameservers (recommended)

### For AWS App Runner (Backend) - api.batorbattle.space:

- **CNAME Record**:
  - Name: `api`
  - Value: `xxxxx.us-east-1.awsapprunner.com` (provided by AWS App Runner)
  - TTL: 3600 (or default)

### Complete DNS Setup Example:

If using manual DNS (not nameservers), your DNS records should look like:

```
Type    Name    Value
A       @       [Netlify IP]
CNAME   www     [your-site.netlify.app]
CNAME   api     [xxxxx.us-east-1.awsapprunner.com]
```

## Testing

1. **Wait for DNS propagation** (can take up to 48 hours, usually 1-2 hours)
2. **Check SSL**: Visit `https://batorbattle.space` - should show secure connection
3. **Test API**: Open browser console on `https://batorbattle.space`
   - Check `window.APP_CONFIG.API_URL` is correct
   - Try creating a room
   - Check for CORS errors

## Troubleshooting

### Domain not resolving?

- Check DNS records are correct
- Wait for DNS propagation (use `dig batorbattle.space` or `nslookup batorbattle.space`)
- Verify nameservers are updated at registrar

### SSL certificate not issued?

- Ensure DNS is properly configured
- Wait 10-15 minutes after DNS propagation
- Check Netlify SSL status in dashboard

### CORS errors?

- Verify `CORS_ORIGIN` in App Runner includes `https://batorbattle.space`
- Check browser console for exact error
- Ensure backend is redeployed after CORS change

### Mixed content errors?

- Ensure all URLs use HTTPS
- Check `API_URL` in Netlify environment variables uses HTTPS
- Verify LiveKit URL uses `wss://` (secure WebSocket)

## Final Configuration Checklist

### Frontend (Netlify)
- [ ] Domain `batorbattle.space` added to Netlify
- [ ] DNS records configured (A record or nameservers)
- [ ] SSL certificate issued (green lock in browser)
- [ ] Test `https://batorbattle.space` loads correctly

### Backend (AWS App Runner)
- [ ] Custom domain `api.batorbattle.space` added in App Runner
- [ ] CNAME record added at domain registrar
- [ ] DNS propagated (check with `dig api.batorbattle.space` or `nslookup api.batorbattle.space`)
- [ ] SSL certificate issued by AWS (shows "Active" in App Runner)
- [ ] `CORS_ORIGIN` updated in App Runner environment variables
- [ ] Backend redeployed with new CORS settings

### Integration
- [ ] `API_URL` in Netlify updated to `https://api.batorbattle.space`
- [ ] Frontend redeployed with new API URL
- [ ] Test site at `https://batorbattle.space`
- [ ] Test room creation and multiplayer features
- [ ] Verify webcam connections work
- [ ] Check browser console for any CORS or connection errors

## Current Configuration

- **Frontend Domain**: `https://batorbattle.space` (Netlify)
- **Backend Domain**: `https://api.batorbattle.space` (AWS App Runner)
- **CORS**: Configured to allow:
  - `https://batorbattle.space`
  - `https://www.batorbattle.space`
  - `https://api.batorbattle.space`
  - `http://localhost:8181` (for local development)

## Testing DNS Configuration

### Check Frontend DNS:
```bash
dig batorbattle.space
# or
nslookup batorbattle.space
```

### Check Backend DNS:
```bash
dig api.batorbattle.space
# or
nslookup api.batorbattle.space
```

Both should resolve to their respective service IPs/domains.
