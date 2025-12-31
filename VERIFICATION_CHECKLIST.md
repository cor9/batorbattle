# Setup Verification Checklist

Use this checklist to verify your image-based deployment setup is complete and correct.

## ✅ What I Can Verify (Already Done)

- [x] **Dockerfile exists** - Located at `/Dockerfile` ✓
- [x] **GitHub Actions workflow exists** - Located at `/.github/workflows/deploy-to-ecr.yml` ✓
- [x] **Workflow file is properly configured** - Has ECR push steps, AWS credentials setup ✓
- [x] **Dockerfile is correct** - Uses Node 18, exposes port 8181, copies server.js ✓

## ⚠️ What YOU Need to Verify

### 1. GitHub Secrets (CRITICAL - Without these, deployments will fail)

**Go to:** `https://github.com/YOUR_USERNAME/batorbattle/settings/secrets/actions`

**Check for these secrets:**
- [ ] `AWS_ACCESS_KEY_ID` - Should start with `AKIA...`
- [ ] `AWS_SECRET_ACCESS_KEY` - Should be a long random string

**How to verify:**
1. Go to your GitHub repo
2. Click "Settings" → "Secrets and variables" → "Actions"
3. You should see both secrets listed
4. If missing, go back to Step 2 in YOUR_STEPS.md

---

### 2. ECR Repository (Must exist in AWS)

**Go to:** `https://console.aws.amazon.com/ecr` (make sure you're in the correct region)

**Check:**
- [ ] Repository named `bator-battle-backend` exists
- [ ] Repository is in the same region as your App Runner service
- [ ] Repository URI looks like: `123456789012.dkr.ecr.us-east-1.amazonaws.com/bator-battle-backend`

**How to verify:**
1. Open AWS Console → ECR
2. Look for `bator-battle-backend` in the list
3. Click on it to see the URI
4. Note the region (e.g., `us-east-1`)

**If missing:** Go back to Step 1 in YOUR_STEPS.md

---

### 3. GitHub Actions Workflow Configuration

**File:** `/.github/workflows/deploy-to-ecr.yml`

**Check these values match your setup:**
- [ ] `AWS_REGION` (line 10) - Should match your ECR repository region
- [ ] `ECR_REPOSITORY` (line 11) - Should be `bator-battle-backend` (or whatever you named it)
- [ ] `APP_RUNNER_SERVICE` (line 12) - Should match your App Runner service name

**Current values in your file:**
```yaml
AWS_REGION: us-east-1
ECR_REPOSITORY: bator-battle-backend
APP_RUNNER_SERVICE: bator-battle-backend
```

**Action needed:**
- If your ECR repository is in a different region, update `AWS_REGION`
- If your ECR repository has a different name, update `ECR_REPOSITORY`
- If your App Runner service has a different name, update `APP_RUNNER_SERVICE`

---

### 4. App Runner Service Configuration

**Go to:** `https://console.aws.amazon.com/apprunner`

**Check your service:**
- [ ] Service exists and is named `bator-battle-backend` (or matches `APP_RUNNER_SERVICE` in workflow)
- [ ] **Source type is "Container registry"** (NOT "Source code repository")
- [ ] **Provider is "Amazon ECR"**
- [ ] **Container image URI** points to `bator-battle-backend` repository
- [ ] **Image tag** is `latest`
- [ ] **Deployment trigger** is set to **"Automatic"** ✅
- [ ] **Port** is set to `8181`
- [ ] **Environment variables** are set:
  - [ ] `LIVEKIT_API_KEY`
  - [ ] `LIVEKIT_API_SECRET`
  - [ ] `LIVEKIT_URL`
  - [ ] `PORT` = `8181`
  - [ ] `NODE_ENV` = `production`
  - [ ] `CORS_ORIGIN` = Your frontend URLs

**How to verify:**
1. Open AWS Console → App Runner
2. Click on your service
3. Click "Configuration" tab
4. Check "Source and deployment" section
5. Verify it says "Container registry" not "Source code repository"

**If wrong:** Go back to Step 5 in YOUR_STEPS.md (Option B: Update existing service)

---

### 5. IAM User and Permissions

**Go to:** `https://console.aws.amazon.com/iam` → Users

**Check:**
- [ ] User `github-actions-ecr` (or whatever you named it) exists
- [ ] User has an active access key
- [ ] User has the `GitHubActionsECRAccess` policy attached

**How to verify:**
1. Go to IAM → Users
2. Find your GitHub Actions user
3. Click on it
4. Check "Permissions" tab - should see `GitHubActionsECRAccess` policy
5. Check "Security credentials" tab - should have at least one active access key

**If missing:** Go back to Step 2 in YOUR_STEPS.md

---

## 🧪 Test Your Setup

Once all checkboxes above are checked, test the deployment:

### Step 1: Make a Test Commit

```bash
cd /Users/coreyralston/batorbattle
# Add a comment to server.js
echo "// Test deployment $(date)" >> server.js
git add server.js
git commit -m "Test image-based deployment"
git push origin main
```

### Step 2: Watch GitHub Actions

1. Go to: `https://github.com/YOUR_USERNAME/batorbattle/actions`
2. You should see "Build and Push to ECR" workflow running
3. Wait for it to complete (2-3 minutes)
4. ✅ Should show green checkmark

**If it fails:**
- Check the error message in the logs
- Most common issues:
  - Missing or incorrect AWS credentials
  - Wrong ECR repository name
  - Wrong AWS region
  - IAM permissions missing

### Step 3: Check ECR Repository

1. Go to: `https://console.aws.amazon.com/ecr`
2. Click on `bator-battle-backend`
3. You should see new images:
   - Tag: `latest`
   - Tag: `abc123def456...` (commit SHA)

**If no images:**
- GitHub Actions workflow failed
- Check GitHub Actions logs for errors

### Step 4: Check App Runner Deployment

1. Go to: `https://console.aws.amazon.com/apprunner`
2. Click on your service
3. You should see a new deployment:
   - Status: "Running" or "In progress"
   - Should complete in 2-5 minutes

**If no deployment:**
- Check if "Automatic" deployment trigger is enabled
- Manually trigger: Click "Deploy" → "Deploy latest revision"

### Step 5: Test the Service

Once deployment completes:

```bash
# Get your App Runner service URL from the console
curl https://your-service-url.awsapprunner.com/api/getToken
```

**Expected:** Should return an error (needs POST), but confirms server is running.

---

## 🚨 Common Issues and Fixes

### Issue: GitHub Actions fails with "Access Denied"

**Fix:**
1. Verify AWS credentials in GitHub Secrets are correct
2. Check IAM user has `GitHubActionsECRAccess` policy
3. Verify access keys haven't expired

### Issue: "Repository not found" error

**Fix:**
1. Check ECR repository name matches `ECR_REPOSITORY` in workflow file
2. Verify repository exists in the same AWS region
3. Check repository name spelling (case-sensitive)

### Issue: App Runner doesn't auto-deploy

**Fix:**
1. Verify "Automatic" deployment trigger is enabled in App Runner
2. Check App Runner is pointing to correct ECR repository
3. Verify image tag is `latest`
4. Manually trigger deployment once to test

### Issue: "Image pull failed" in App Runner

**Fix:**
1. Verify ECR repository and App Runner are in same AWS region
2. Check image tag exists in ECR (go to ECR and verify `latest` tag)
3. Verify App Runner service has permission to pull from ECR

---

## ✅ Success Criteria

Your setup is correct when:

1. ✅ All checkboxes above are checked
2. ✅ GitHub Actions workflow completes successfully
3. ✅ Images appear in ECR repository
4. ✅ App Runner automatically deploys new images
5. ✅ Service URL is accessible and returns responses

---

## Next Steps

Once everything is verified and working:

1. **Monitor first few deployments** to ensure stability
2. **Set up CloudWatch alarms** for service health
3. **Add deployment notifications** (optional)
4. **Document your specific configuration** for future reference

---

## Quick Reference

- **GitHub Secrets:** `https://github.com/YOUR_USERNAME/batorbattle/settings/secrets/actions`
- **ECR Console:** `https://console.aws.amazon.com/ecr`
- **App Runner Console:** `https://console.aws.amazon.com/apprunner`
- **IAM Console:** `https://console.aws.amazon.com/iam`
- **GitHub Actions:** `https://github.com/YOUR_USERNAME/batorbattle/actions`

Replace `YOUR_USERNAME` with your actual GitHub username.
