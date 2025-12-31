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

### Option A: Image-Based Deployment (Recommended for Speed) ⚡

**Why Image-Based?**
- Faster deployments (~2-5 minutes vs ~10-15 minutes)
- Build happens in GitHub Actions (often faster than App Runner)
- More control over the build process
- Better for CI/CD pipelines

#### Prerequisites:
1. AWS ECR repository created
2. GitHub Actions secrets configured (see below)

#### Setup Steps:

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name bator-battle-backend --region us-east-1
   ```
   Note the repository URI (e.g., `123456789012.dkr.ecr.us-east-1.amazonaws.com/bator-battle-backend`)

2. **Configure GitHub Secrets**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   Add these secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

   **Note:** Create an IAM user with these permissions:
   - `ecr:GetAuthorizationToken`
   - `ecr:BatchCheckLayerAvailability`
   - `ecr:GetDownloadUrlForLayer`
   - `ecr:BatchGetImage`
   - `ecr:PutImage`
   - `ecr:InitiateLayerUpload`
   - `ecr:UploadLayerPart`
   - `ecr:CompleteLayerUpload`

3. **Update GitHub Actions Workflow** (if needed)
   Edit `.github/workflows/deploy-to-ecr.yml`:
   - Update `AWS_REGION` to your region
   - Update `ECR_REPOSITORY` to match your ECR repository name
   - Update `APP_RUNNER_SERVICE` to your App Runner service name

4. **Create App Runner Service with Image Source**
   - Go to AWS App Runner Console
   - Click "Create service"
   - Select **"Container registry"** (not Source code repository)
   - Choose "Amazon ECR"
   - Select your ECR repository
   - Image tag: `latest` (or specific tag)
   - Deployment trigger: **"Automatic"** (deploys when new image is pushed)

5. **Service Settings**
   - Service name: `bator-battle-backend`
   - Port: `8181`
   - Start command: (leave default, uses Dockerfile CMD)

6. **Environment Variables**
   Add these in the environment variables section:
   ```
   LIVEKIT_API_KEY=your-livekit-api-key
   LIVEKIT_API_SECRET=your-livekit-api-secret
   LIVEKIT_URL=wss://your-livekit-server.com
   PORT=8181
   NODE_ENV=production
   CORS_ORIGIN=https://your-netlify-site.netlify.app,https://batorbattle.space
   ```

7. **Create Service**
   - Review and create
   - Initial deployment will take ~5 minutes
   - Subsequent deployments (via GitHub Actions) will be ~2-5 minutes

8. **Automatic Deployments**
   - Every push to `main` branch triggers GitHub Actions
   - GitHub Actions builds and pushes image to ECR
   - App Runner automatically deploys the new image (if auto-deploy is enabled)

### Option B: Code-Based Deployment (Dockerfile)

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
   - Port: `8181`
   - Start command: (leave default)

4. **Environment Variables**
   Add these in the environment variables section:
   ```
   LIVEKIT_API_KEY=your-livekit-api-key
   LIVEKIT_API_SECRET=your-livekit-api-secret
   LIVEKIT_URL=wss://your-livekit-server.com
   PORT=8181
   NODE_ENV=production
   ```

5. **Create Service**
   - Review and create
   - Wait for deployment (10-15 minutes)
   - Note the service URL (e.g., `https://xxxxx.us-east-1.awsapprunner.com`)

### Option C: Using apprunner.yaml

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

## Deployment Speed Comparison

### Code-Based Deployment (Option B/C)
- **Build time:** 10-15 minutes
- **Why slow:** App Runner builds from source, runs `npm install` during deployment
- **Best for:** Simple setups, one-off deployments

### Image-Based Deployment (Option A) ⚡
- **Build time:** 2-5 minutes
- **Why fast:** GitHub Actions builds image, App Runner just pulls and runs
- **Best for:** Frequent deployments, CI/CD pipelines
- **Trade-off:** Requires ECR repository and GitHub Actions setup

## Cost Estimation

### AWS App Runner
- Free tier: None
- Pricing: ~$0.007 per vCPU per hour + $0.0008 per GB memory per hour
- Estimated: $5-15/month for low traffic

### AWS ECR (for Image-Based Deployment)
- Free tier: 500MB storage, 500MB/month data transfer
- Pricing: $0.10 per GB/month storage, $0.10 per GB data transfer
- Estimated: $0-2/month for small images

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

