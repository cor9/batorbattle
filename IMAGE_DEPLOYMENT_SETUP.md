# Quick Setup: Image-Based Deployment for Faster Builds

This guide helps you switch from code-based to image-based deployment for **2-5x faster deployments**.

## Why Switch?

- **Current (Code-based):** 10-15 minutes per deployment
- **Image-based:** 2-5 minutes per deployment
- **How:** GitHub Actions builds the image, App Runner just pulls and runs it

## Quick Setup (5 Steps)

### 1. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name bator-battle-backend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

**Note:** Replace `us-east-1` with your AWS region.

### 2. Configure GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/batorbattle/settings/secrets/actions`

Add these secrets:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

**IAM Policy Required:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Update GitHub Actions Workflow

Edit `.github/workflows/deploy-to-ecr.yml`:

```yaml
env:
  AWS_REGION: us-east-1  # ← Change to your region
  ECR_REPOSITORY: bator-battle-backend  # ← Match your ECR repo name
  APP_RUNNER_SERVICE: bator-battle-backend  # ← Your App Runner service name
```

### 4. Create/Update App Runner Service

**If creating new service:**
1. Go to AWS App Runner Console
2. Click "Create service"
3. Select **"Container registry"** (NOT "Source code repository")
4. Choose "Amazon ECR"
5. Select your repository
6. Image tag: `latest`
7. Deployment trigger: **"Automatic"** ✅
8. Port: `8181`
9. Add environment variables (see DEPLOYMENT.md)

**If updating existing service:**
1. Go to your App Runner service
2. Click "Edit" → "Source and deployment"
3. Change source to "Container registry"
4. Select your ECR repository
5. Enable automatic deployments

### 5. Test It

1. Push to `main` branch:
   ```bash
   git push origin main
   ```

2. Watch GitHub Actions:
   - Go to Actions tab in GitHub
   - See workflow build and push image

3. Watch App Runner:
   - Go to AWS App Runner Console
   - See automatic deployment trigger
   - Deployment should complete in ~2-5 minutes

## Verification

After first deployment, verify:
- ✅ GitHub Actions workflow completes successfully
- ✅ Image appears in ECR repository
- ✅ App Runner service shows new deployment
- ✅ Service URL is accessible

## Troubleshooting

**GitHub Actions fails:**
- Check AWS credentials in secrets
- Verify IAM permissions
- Check ECR repository name matches

**App Runner doesn't auto-deploy:**
- Verify "Automatic" deployment trigger is enabled
- Check ECR repository is selected correctly
- Manually trigger deployment once to test

**Image not found:**
- Verify image tag (`latest` or specific tag)
- Check ECR repository region matches App Runner region

## Next Steps

Once working, you can:
- Add deployment notifications (Slack, email)
- Add image scanning in ECR
- Set up staging/production environments
- Add rollback capabilities

