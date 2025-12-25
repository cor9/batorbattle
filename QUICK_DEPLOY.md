# Quick Deployment Checklist

## ✅ Code Pushed to Git
Your code has been pushed to: `https://github.com/cor9/batorbattle.git`

## 🚀 Deploy Backend to AWS App Runner

### 1. Go to AWS App Runner Console
- Navigate to: https://console.aws.amazon.com/apprunner
- Click "Create service"

### 2. Source Configuration
- **Source**: Source code repository
- **Connect**: GitHub (authorize if needed)
- **Repository**: `cor9/batorbattle`
- **Branch**: `main`
- **Deployment trigger**: Automatic
- **Build type**: Docker
- **Dockerfile path**: `Dockerfile`

### 3. Service Settings
- **Service name**: `bator-battle-backend`
- **Virtual CPU**: 0.25 vCPU (minimum)
- **Memory**: 0.5 GB (minimum)
- **Port**: `3000`

### 4. Environment Variables
Add these in the environment variables section:

```
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-server.com
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

**Note**: After getting your Netlify URL, update `CORS_ORIGIN` to your Netlify domain.

### 5. Create & Wait
- Click "Create & deploy"
- Wait 5-10 minutes for deployment
- **Copy the service URL** (e.g., `https://xxxxx.us-east-1.awsapprunner.com`)

## 🌐 Deploy Frontend to Netlify

### 1. Go to Netlify Dashboard
- Navigate to: https://app.netlify.com
- Click "Add new site" > "Import an existing project"

### 2. Connect Repository
- **Git provider**: GitHub
- **Repository**: `cor9/batorbattle`
- **Branch**: `main`

### 3. Build Settings
- **Build command**: `chmod +x build.sh && ./build.sh`
- **Publish directory**: `.` (dot/period)
- **Base directory**: (leave empty)

### 4. Environment Variables
Click "Show advanced" and add:

```
API_URL=https://your-app-runner-url.awsapprunner.com
```

Replace with your actual App Runner URL from step 5 above.

### 5. Deploy
- Click "Deploy site"
- Wait 2-3 minutes
- **Copy your Netlify URL** (e.g., `https://xxxxx.netlify.app`)

## 🔄 Update CORS After Netlify Deployment

1. Go back to AWS App Runner
2. Edit your service
3. Update environment variable:
   ```
   CORS_ORIGIN=https://your-netlify-url.netlify.app
   ```
4. Save and wait for redeployment

## ✅ Test Your Deployment

1. Visit your Netlify URL
2. Open browser console (F12)
3. Check `window.APP_CONFIG` - should show your App Runner URL
4. Try creating a room and joining
5. Check for any errors in console

## 📝 Important URLs to Save

- **Backend URL**: `https://xxxxx.awsapprunner.com`
- **Frontend URL**: `https://xxxxx.netlify.app`
- **LiveKit URL**: `wss://xxxxx.livekit.cloud`

## 🐛 Troubleshooting

### Backend not connecting?
- Check AWS App Runner logs in CloudWatch
- Verify environment variables are set
- Check service is running (green status)

### Frontend can't reach backend?
- Verify `API_URL` in Netlify environment variables
- Check browser console for CORS errors
- Update `CORS_ORIGIN` in App Runner to match Netlify URL

### Webcam not working?
- Ensure HTTPS (required for WebRTC)
- Check browser permissions
- Verify LiveKit credentials are correct

## 💰 Cost Estimate

- **AWS App Runner**: ~$5-15/month (low traffic)
- **Netlify**: Free tier (100GB bandwidth)
- **LiveKit**: Free tier (10GB egress/month)

Total: **$0-20/month** for small-medium traffic

