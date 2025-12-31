# Your Steps: Setting Up Image-Based Deployment

This document lists **exactly what YOU need to do** to set up faster image-based deployments.

---

## Step 1: Create Amazon ECR Repository

**What you're doing:** Creating a container registry where GitHub Actions will push Docker images.

### Action Items:

1. **Open AWS Console**

   - Go to https://console.aws.amazon.com
   - Make sure you're in the correct region (e.g., `us-east-1`)

2. **Navigate to ECR**

   - Search for "ECR" in the top search bar
   - Click "Amazon ECR" (Elastic Container Registry)

3. **Create Repository**

   - Click the orange "Create repository" button
   - **Repository name:** `bator-battle-backend`
   - **Tag immutability:** Leave as default (disabled is fine)
   - **Scan on push:** ✅ Enable (recommended for security)
   - **Encryption:** Leave as default (AWS managed)
   - Click "Create repository"

4. **Note the Repository URI**
   - After creation, you'll see a page with repository details
   - **Copy the URI** (looks like: `123456789012.dkr.ecr.us-east-1.amazonaws.com/bator-battle-backend`)
   - You'll need this later (but it's also visible in the repository list)

**✅ Checkpoint:** You should now see `bator-battle-backend` in your ECR repositories list.

---

## Step 2: Get AWS Credentials (THE MOST IMPORTANT STEP!)

**What you need:** Two pieces of text that look like this:

- Access key ID: `AKIAIOSFODNN7EXAMPLE` (starts with AKIA)
- Secret access key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` (long random string)

### Method 1: Create New User (If you haven't created one yet)

1. **Go to IAM:**

   - https://console.aws.amazon.com/iam
   - Click "Users" (left side)
   - Click "Create user"

2. **Name it:**

   - User name: `github-actions-ecr`
   - ✅ Check "Access key - Programmatic access"
   - Click "Next"

3. **Set Permissions:**

   - Click "Attach policies directly"
   - Click "Create policy" (blue button)
   - Click "JSON" tab
   - **Delete everything** in the box
   - **Paste this:**

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

   - Click "Next"
   - Policy name: `GitHubActionsECRAccess`
   - Click "Create policy"
   - **Go back to the Create user tab**
   - Click refresh (circular arrow icon)
   - Search: `GitHubActionsECRAccess`
   - ✅ Check the box
   - Click "Next"
   - Click "Create user"

4. **GET YOUR CREDENTIALS:**
   - **You should see a page that says "Access key created"**
   - **If you see it:**
     - Click "Show" next to "Secret access key"
     - Copy the Access key ID (starts with AKIA...)
     - Copy the Secret access key (long string)
     - **SAVE BOTH SOMEWHERE!** (Notes app, text file, etc.)
   - **If you DON'T see it, use Method 2 below**

### Method 2: Get Credentials from Existing User (If you already created the user)

**If you already created the user but didn't save the credentials, here's how to get them:**

1. **Go to your user:**

   - https://console.aws.amazon.com/iam → Users
   - Click on `github-actions-ecr` (or whatever you named it)

2. **Go to Security Credentials:**

   - Click "Security credentials" tab (top of page)

3. **Create Access Key:**

   - Scroll to "Access keys" section
   - Click "Create access key" button
   - Select "Application running outside AWS"
   - ✅ Check the confirmation box
   - Click "Next"
   - (Optional) Description: `GitHub Actions`
   - Click "Create access key"

4. **NOW YOU'LL SEE THE CREDENTIALS:**
   - **Access key ID:** Copy this (starts with AKIA...)
   - **Secret access key:** Click "Show" and copy this
   - **SAVE BOTH IMMEDIATELY!**

**✅ Checkpoint:** You have TWO things saved:

1. Access key ID (looks like: `AKIAIOSFODNN7EXAMPLE`)
2. Secret access key (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

**If you don't have both, go back and use Method 2 above!**

---

## Step 3: Add GitHub Secrets

**What you're doing:** Storing AWS credentials in GitHub so the workflow can access them securely.

### Action Items:

1. **Open Your GitHub Repository**

   - Go to `https://github.com/YOUR_USERNAME/batorbattle`
   - (Replace `YOUR_USERNAME` with your actual GitHub username)

2. **Navigate to Secrets**

   - Click the "Settings" tab (top of the repository)
   - In the left sidebar, click "Secrets and variables"
   - Click "Actions"

3. **Add First Secret: AWS_ACCESS_KEY_ID**

   - Click "New repository secret"
   - **Name:** `AWS_ACCESS_KEY_ID`
   - **Secret:** Paste the Access Key ID from Step 2
   - Click "Add secret"

4. **Add Second Secret: AWS_SECRET_ACCESS_KEY**
   - Click "New repository secret" again
   - **Name:** `AWS_SECRET_ACCESS_KEY`
   - **Secret:** Paste the Secret Access Key from Step 2
   - Click "Add secret"

**✅ Checkpoint:** You should see both secrets listed in the Actions secrets page.

---

## Step 4: Update GitHub Actions Workflow File

**What you're doing:** Configuring the workflow to use your specific AWS region and repository name.

### Action Items:

1. **Open the Workflow File**

   - In your repository, navigate to `.github/workflows/deploy-to-ecr.yml`
   - Click the file to open it
   - Click the pencil icon (✏️) to edit

2. **Update the Configuration**

   - Find the `env:` section at the top:

   ```yaml
   env:
     AWS_REGION: us-east-1 # ← Change this to YOUR AWS region
     ECR_REPOSITORY: bator-battle-backend # ← Should match your ECR repo name
     APP_RUNNER_SERVICE: bator-battle-backend # ← Your App Runner service name
   ```

3. **Make Changes:**

   - **AWS_REGION:** Change `us-east-1` to your actual AWS region
     - Common regions: `us-east-1`, `us-west-2`, `eu-west-1`, etc.
     - Check your ECR repository URL to see which region you used
   - **ECR_REPOSITORY:** Should already be `bator-battle-backend` (match what you created in Step 1)
   - **APP_RUNNER_SERVICE:** Change to your App Runner service name
     - If you haven't created it yet, use `bator-battle-backend`
     - If you already have one, use that exact name

4. **Commit the Changes**
   - Scroll down to the commit section
   - **Commit message:** `Configure GitHub Actions for ECR deployment`
   - Choose "Commit directly to the main branch" (or create a branch if you prefer)
   - Click "Commit changes"

**✅ Checkpoint:** The workflow file is updated and committed to your repository.

---

## Step 5: Create or Update App Runner Service

**What you're doing:** Setting up App Runner to pull images from ECR instead of building from source.

### Option A: Creating a NEW App Runner Service

1. **Open App Runner Console**

   - Go to https://console.aws.amazon.com/apprunner
   - Click "Create service"

2. **Source Configuration**

   - **Source type:** Select **"Container registry"** (NOT "Source code repository")
   - **Provider:** Select "Amazon ECR"
   - **Container image URI:**
     - Click "Browse" or manually enter
     - Select your repository: `bator-battle-backend`
     - **Image tag:** `latest`
   - **Deployment trigger:** Select **"Automatic"** ✅
     - This means App Runner will auto-deploy when new images are pushed

3. **Service Settings**

   - **Service name:** `bator-battle-backend` (or your preferred name)
   - **Virtual CPU:** 1 vCPU (or 0.5 vCPU for lower cost)
   - **Memory:** 2 GB (or 1 GB for lower cost)
   - **Port:** `8181`
   - **Start command:** Leave empty (uses Dockerfile CMD)

4. **Environment Variables**

   - Click "Add environment variable" for each:

   | Name                 | Value                                                                                |
   | -------------------- | ------------------------------------------------------------------------------------ |
   | `LIVEKIT_API_KEY`    | Your LiveKit API key                                                                 |
   | `LIVEKIT_API_SECRET` | Your LiveKit API secret                                                              |
   | `LIVEKIT_URL`        | Your LiveKit URL (e.g., `wss://your-livekit-server.com`)                             |
   | `PORT`               | `8181`                                                                               |
   | `NODE_ENV`           | `production`                                                                         |
   | `CORS_ORIGIN`        | Your frontend URLs (e.g., `https://batorbattle.space,https://your-site.netlify.app`) |

5. **Create Service**
   - Review all settings
   - Click "Create & deploy"
   - Wait for initial deployment (~5 minutes)

**✅ Checkpoint:** App Runner service is created and deploying.

### Option B: Updating EXISTING App Runner Service

1. **Open Your App Runner Service**

   - Go to https://console.aws.amazon.com/apprunner
   - Click on your existing service name

2. **Edit Source Configuration**

   - Click "Edit" button (top right)
   - Click "Source and deployment" section
   - **Source type:** Change to **"Container registry"**
   - **Provider:** Select "Amazon ECR"
   - **Container image URI:**
     - Click "Browse" or enter manually
     - Select: `bator-battle-backend`
     - **Image tag:** `latest`
   - **Deployment trigger:** Select **"Automatic"** ✅

3. **Save Changes**
   - Click "Save changes"
   - App Runner will start deploying from the ECR image

**✅ Checkpoint:** App Runner service is updated to use ECR images.

---

## Step 6: Test the Setup

**What you're doing:** Verifying everything works end-to-end.

### Action Items:

1. **Make a Small Change**

   - Edit any file (e.g., add a comment to `server.js`)
   - Commit and push:
     ```bash
     git add .
     git commit -m "Test image-based deployment"
     git push origin main
     ```

2. **Watch GitHub Actions**

   - Go to your GitHub repository
   - Click the "Actions" tab
   - You should see "Build and Push to ECR" workflow running
   - Wait for it to complete (usually 2-3 minutes)
   - ✅ Should show green checkmark when done

3. **Check ECR Repository**

   - Go back to AWS Console → ECR
   - Click on `bator-battle-backend` repository
   - You should see new images with tags:
     - `latest`
     - A commit SHA (e.g., `abc123def456...`)

4. **Check App Runner**

   - Go to AWS Console → App Runner
   - Click on your service
   - You should see a new deployment in progress or completed
   - Deployment should complete in ~2-5 minutes (much faster than before!)

5. **Verify Service is Running**
   - In App Runner, note the service URL
   - Test it:
     ```bash
     curl https://your-service-url.awsapprunner.com/api/getToken
     ```
   - Should return an error (needs POST), but confirms server is running

**✅ Checkpoint:** Everything is working! Deployments should now be 2-5 minutes instead of 10-15 minutes.

---

## Troubleshooting

### GitHub Actions Fails

**Error: "Access Denied" or "Unauthorized"**

- ✅ Check: AWS credentials in GitHub Secrets are correct
- ✅ Check: IAM user has the ECR permissions policy attached
- ✅ Check: Access keys haven't expired or been deleted

**Error: "Repository not found"**

- ✅ Check: ECR repository name matches `ECR_REPOSITORY` in workflow file
- ✅ Check: Repository exists in the same AWS region

### App Runner Doesn't Auto-Deploy

**No deployment triggered after GitHub Actions completes**

- ✅ Check: "Automatic" deployment trigger is enabled in App Runner
- ✅ Check: App Runner is pointing to the correct ECR repository
- ✅ Check: Image tag is `latest` (or matches what App Runner expects)
- **Manual workaround:** In App Runner, click "Deploy" → "Deploy latest revision"

### Image Not Found in App Runner

**Error: "Image pull failed"**

- ✅ Check: ECR repository and App Runner are in the same AWS region
- ✅ Check: App Runner service has permission to pull from ECR
  - App Runner automatically gets permissions, but verify the repository exists
- ✅ Check: Image tag exists (go to ECR and verify `latest` tag is there)

---

## Summary Checklist

Before you start, make sure you have:

- [ ] AWS account access
- [ ] GitHub repository access
- [ ] LiveKit credentials (for environment variables)

Steps to complete:

- [ ] Step 1: Create ECR repository
- [ ] Step 2: Create IAM user and save credentials
- [ ] Step 3: Add GitHub secrets
- [ ] Step 4: Update workflow file
- [ ] Step 5: Create/update App Runner service
- [ ] Step 6: Test the setup

**Estimated total time:** 15-20 minutes

---

## Need Help?

If you get stuck:

1. Check the error messages in GitHub Actions logs
2. Check CloudWatch logs in AWS App Runner
3. Verify each step's checkpoint before moving to the next
4. Common issues are usually credential/permission related
