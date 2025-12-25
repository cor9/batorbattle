# Next Steps After DNS Configuration

Your DNS is set up! Here's what to do next:

## ✅ What's Already Done

- [x] DNS records configured in Namecheap:
  - `@` → Netlify (ALIAS record)
  - `www` → Netlify (CNAME)
  - `api` → AWS App Runner (CNAME) ✅

## 🔄 Step 1: Add Custom Domain in AWS App Runner

1. Go to AWS App Runner Console: https://console.aws.amazon.com/apprunner
2. Select your service (e.g., `bator-battle-backend`)
3. Click **Custom domains** tab
4. Click **Add domain**
5. Enter: `api.batorbattle.space`
6. Click **Add**
7. AWS will verify DNS and provision SSL certificate (takes 5-15 minutes)

**Status will show:**
- "Pending" → Waiting for DNS verification
- "Active" → SSL certificate issued and ready! ✅

## 🔄 Step 2: Update CORS in AWS App Runner

After the custom domain is active:

1. Go to your App Runner service
2. Click **Configuration** tab
3. Click **Edit** next to Environment variables
4. Update `CORS_ORIGIN` to:
   ```
   https://batorbattle.space,https://www.batorbattle.space,https://api.batorbattle.space
   ```
5. Click **Save**
6. Wait for redeployment (2-3 minutes)

## 🔄 Step 3: Update API URL in Netlify

1. Go to Netlify dashboard: https://app.netlify.com
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Update `API_URL` to:
   ```
   https://api.batorbattle.space
   ```
5. Trigger a new deploy:
   - Go to **Deploys** tab
   - Click **Trigger deploy** > **Deploy site**
   - Or push a commit to trigger auto-deploy

## ⏱️ Step 4: Wait for DNS Propagation

- DNS changes can take **1-48 hours** (usually 1-2 hours)
- Check propagation: https://www.whatsmydns.net/#CNAME/api.batorbattle.space
- Test locally:
  ```bash
  dig api.batorbattle.space
  # or
  nslookup api.batorbattle.space
  ```

## ✅ Step 5: Test Everything

### Test Backend API:
```bash
# Should return an error (needs POST), but confirms server is running
curl https://api.batorbattle.space/api/getToken
```

### Test Frontend:
1. Visit `https://batorbattle.space`
2. Open browser console (F12)
3. Check `window.APP_CONFIG.API_URL` - should be `https://api.batorbattle.space`
4. Try creating a room
5. Check for any CORS errors in console

### Test Full Flow:
1. Go to `https://batorbattle.space`
2. Pass age gate
3. Create or join a room
4. Verify webcam connections work
5. Test chat functionality
6. Test game synchronization

## 🐛 Troubleshooting

### Backend not accessible?
- Check AWS App Runner service is running (green status)
- Verify custom domain shows "Active" in App Runner
- Wait for DNS propagation
- Check CloudWatch logs for errors

### CORS errors?
- Verify `CORS_ORIGIN` includes `https://batorbattle.space`
- Check backend was redeployed after CORS change
- Clear browser cache and try again

### Frontend can't connect to backend?
- Verify `API_URL` in Netlify is `https://api.batorbattle.space`
- Check Netlify deploy completed successfully
- Open browser console and check `window.APP_CONFIG`

### SSL certificate not issued?
- Wait 10-15 minutes after DNS propagation
- Check custom domain status in AWS App Runner
- Verify DNS is fully propagated

## 📋 Final Checklist

- [ ] Custom domain `api.batorbattle.space` added in AWS App Runner
- [ ] Custom domain status is "Active" in AWS App Runner
- [ ] `CORS_ORIGIN` updated in AWS App Runner environment variables
- [ ] Backend redeployed with new CORS settings
- [ ] `API_URL` updated in Netlify to `https://api.batorbattle.space`
- [ ] Frontend redeployed with new API URL
- [ ] DNS propagated (check with dig/nslookup)
- [ ] Test `https://batorbattle.space` loads
- [ ] Test `https://api.batorbattle.space` responds
- [ ] Test room creation works
- [ ] Test webcam connections
- [ ] Test chat functionality
- [ ] No CORS errors in browser console

## 🎉 You're Done!

Once all steps are complete, your app will be fully functional at:
- **Frontend**: `https://batorbattle.space`
- **Backend**: `https://api.batorbattle.space`

Both will have SSL certificates and be ready for production use!

