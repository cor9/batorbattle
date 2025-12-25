# Custom Domain Setup: batorbattle.space

This guide covers setting up the custom domain `batorbattle.space` for both frontend (Netlify) and backend (AWS App Runner).

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

## Backend (AWS App Runner) - api.batorbattle.space (Optional)

### Option 1: Use App Runner Default URL
- Keep using the App Runner service URL
- Update CORS to allow `https://batorbattle.space`

### Option 2: Custom Domain for Backend
1. Go to AWS App Runner console
2. Select your service
3. Go to **Custom domains**
4. Click **Add domain**
5. Enter: `api.batorbattle.space`
6. Follow DNS configuration instructions
7. Update CORS to include the custom domain

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

### For AWS App Runner (Backend - if using custom domain):
- **CNAME**: `api` → `your-app-runner-service.awsapprunner.com`

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

- [ ] Domain added to Netlify
- [ ] DNS records configured
- [ ] SSL certificate issued (green lock in browser)
- [ ] `CORS_ORIGIN` updated in AWS App Runner
- [ ] Backend redeployed with new CORS settings
- [ ] `API_URL` in Netlify points to correct backend URL
- [ ] Test site at `https://batorbattle.space`
- [ ] Test room creation and multiplayer features
- [ ] Verify webcam connections work

## Current Configuration

- **Frontend Domain**: `https://batorbattle.space`
- **Backend**: AWS App Runner service URL (or `api.batorbattle.space` if configured)
- **CORS**: Configured to allow `https://batorbattle.space`

