# Deployment Guide

This guide covers deploying Bator Battle to AWS App Runner (backend) and Netlify (frontend).

## Prerequisites

1. AWS Account with App Runner access
2. Netlify Account
3. LiveKit account and credentials
4. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Push to Git

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Multiplayer edge battle game with webcams"

# Push to your repository
git push origin main
```

## Step 2: Deploy Backend to AWS App Runner

### Option A: Using Dockerfile (Recommended)

1. **Go to AWS App Runner Console**
   - Navigate to AWS Console > App Runner
   - Click "Create service"

2. **Source Configuration**
   - Select "Source code repository"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository and branch (main)
   - Build type: Docker
   - Dockerfile path: `Dockerfile`

3. **Service Settings**
   - Service name: `bator-battle-backend`
   - Port: `3000`
   - Start command: (leave default)

4. **Environment Variables**
   Add these in the environment variables section:
   ```
   LIVEKIT_API_KEY=your-livekit-api-key
   LIVEKIT_API_SECRET=your-livekit-api-secret
   LIVEKIT_URL=wss://your-livekit-server.com
   PORT=3000
   NODE_ENV=production
   ```

5. **Create Service**
   - Review and create
   - Wait for deployment (5-10 minutes)
   - Note the service URL (e.g., `https://xxxxx.us-east-1.awsapprunner.com`)

### Option B: Using apprunner.yaml

1. Follow steps 1-2 above
2. Build type: YAML
3. YAML file path: `apprunner.yaml`
4. Continue with environment variables as above

## Step 3: Deploy Frontend to Netlify

1. **Go to Netlify Dashboard**
   - Log in to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"

2. **Connect Repository**
   - Connect your Git provider
   - Select your repository
   - Branch: `main`

3. **Build Settings**
   - Build command: `chmod +x build.sh && ./build.sh`
   - Publish directory: `.` (root)
   - Base directory: (leave empty)

4. **Environment Variables**
   Click "Show advanced" and add:
   ```
   API_URL=https://your-app-runner-url.awsapprunner.com
   ```
   Replace with your actual App Runner URL from Step 2.

5. **Deploy**
   - Click "Deploy site"
   - Wait for deployment (2-3 minutes)

6. **Update Frontend Code (if needed)**
   After deployment, update `config.js` if the API URL wasn't injected correctly:
   - Go to Site settings > Build & deploy > Environment
   - Verify `API_URL` is set
   - Trigger a new deploy if needed

## Step 4: Update CORS Settings

After deployment, you may need to update CORS in `server.js` to allow your Netlify domain:

```javascript
const io = new Server(server, {
  cors: {
    origin: ['https://your-site.netlify.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});
```

Then redeploy the backend.

## Step 5: Test Deployment

1. **Test Backend**
   ```bash
   curl https://your-app-runner-url.awsapprunner.com/api/getToken
   ```
   Should return an error (needs POST), but confirms server is running.

2. **Test Frontend**
   - Visit your Netlify URL
   - Open browser console (F12)
   - Check for any errors
   - Verify `API_URL` is correct in console: `console.log(window.APP_CONFIG)`

## Troubleshooting

### Backend Issues

**App Runner deployment fails:**
- Check CloudWatch logs in AWS Console
- Verify environment variables are set correctly
- Ensure Dockerfile is correct

**CORS errors:**
- Update CORS origin in `server.js` to include Netlify domain
- Redeploy backend

**LiveKit connection fails:**
- Verify LiveKit credentials in environment variables
- Check LiveKit server URL is correct
- Ensure WebSocket connections are allowed

### Frontend Issues

**API URL not updating:**
- Check Netlify environment variables
- Verify build script ran successfully
- Check Netlify build logs
- Manually update `config.js` if needed

**WebSocket connection fails:**
- Verify backend URL is correct
- Check browser console for errors
- Ensure backend is deployed and running

## Custom Domain (Optional)

### Netlify
1. Go to Site settings > Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### AWS App Runner
1. Go to App Runner service settings
2. Add custom domain
3. Configure DNS as instructed

## Monitoring

### AWS App Runner
- CloudWatch Logs: View application logs
- CloudWatch Metrics: Monitor performance
- Service health: Check service status

### Netlify
- Deploy logs: View build and deploy logs
- Function logs: (if using Netlify Functions)
- Analytics: Enable in site settings

## Cost Estimation

### AWS App Runner
- Free tier: None
- Pricing: ~$0.007 per vCPU per hour + $0.0008 per GB memory per hour
- Estimated: $5-15/month for low traffic

### Netlify
- Free tier: 100GB bandwidth, 300 build minutes/month
- Pro: $19/month for more features
- Estimated: Free tier sufficient for small-medium traffic

### LiveKit
- Free tier: 10GB egress/month
- Pricing: Pay-as-you-go after free tier
- Estimated: $0-20/month depending on usage

## Security Notes

1. **Environment Variables**: Never commit `.env` file
2. **HTTPS**: Both App Runner and Netlify provide HTTPS by default
3. **CORS**: Restrict to your domains only
4. **API Keys**: Store securely in environment variables
5. **Rate Limiting**: Consider adding rate limiting for production

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domains
3. Set up CI/CD for automatic deployments
4. Add error tracking (e.g., Sentry)
5. Set up analytics (optional)

