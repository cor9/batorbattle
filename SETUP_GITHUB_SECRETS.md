# Quick Guide: Setting Up GitHub Secrets

You need to add AWS credentials to GitHub so the deployment workflow can push images to ECR.

---

## Step 1: Get Your AWS Credentials

You need **two pieces of information**:
1. **Access Key ID** (starts with `AKIA...`)
2. **Secret Access Key** (long random string)

### Option A: You Already Have an IAM User

If you already created a user called `github-actions-ecr`:

1. Go to: https://console.aws.amazon.com/iam → Users
2. Click on `github-actions-ecr`
3. Click "Security credentials" tab
4. Scroll to "Access keys" section
5. Click "Create access key"
6. Select "Application running outside AWS"
7. Click "Next" → "Create access key"
8. **Copy both values immediately** (you can only see the secret once!)

### Option B: Create a New IAM User

If you haven't created the user yet:

1. **Go to IAM:**
   - https://console.aws.amazon.com/iam
   - Click "Users" (left sidebar)
   - Click "Create user"

2. **Name the user:**
   - User name: `github-actions-ecr`
   - ✅ Check "Access key - Programmatic access"
   - Click "Next"

3. **Set Permissions:**
   - Click "Attach policies directly"
   - Click "Create policy" (blue button)
   - Click "JSON" tab
   - **Delete everything** in the box
   - **Paste this JSON:**

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
   - **Go back to the Create user tab** (don't close it!)
   - Click the refresh icon (circular arrow)
   - Search for: `GitHubActionsECRAccess`
   - ✅ Check the box next to it
   - Click "Next"
   - Click "Create user"

4. **Get Your Credentials:**
   - You should see "Access key created" page
   - **Access key ID:** Copy this (starts with `AKIA...`)
   - **Secret access key:** Click "Show" and copy this
   - **SAVE BOTH IMMEDIATELY!** (You can only see the secret once)

---

## Step 2: Add Secrets to GitHub

Now add these credentials to your GitHub repository:

1. **Open Your GitHub Repository:**
   - Go to: `https://github.com/YOUR_USERNAME/batorbattle`
   - (Replace `YOUR_USERNAME` with your actual GitHub username)

2. **Navigate to Secrets:**
   - Click the **"Settings"** tab (top of repository page)
   - In the left sidebar, click **"Secrets and variables"**
   - Click **"Actions"**

3. **Add First Secret: AWS_ACCESS_KEY_ID**
   - Click **"New repository secret"** button
   - **Name:** `AWS_ACCESS_KEY_ID`
   - **Secret:** Paste your Access Key ID (starts with `AKIA...`)
   - Click **"Add secret"**

4. **Add Second Secret: AWS_SECRET_ACCESS_KEY**
   - Click **"New repository secret"** again
   - **Name:** `AWS_SECRET_ACCESS_KEY`
   - **Secret:** Paste your Secret Access Key (long string)
   - Click **"Add secret"**

---

## Step 3: Verify Secrets Are Added

1. You should now see both secrets listed:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. **Important:** The secret values are hidden (you'll only see `••••••••`), which is normal and secure.

---

## ✅ Done!

Once both secrets are added, your GitHub Actions workflow will be able to:
- Authenticate with AWS
- Push Docker images to ECR
- Trigger App Runner deployments

---

## Next Steps

After adding the secrets:

1. Go back to `VERIFICATION_CHECKLIST.md`
2. Check off the GitHub Secrets section
3. Continue with the rest of the verification steps
4. Test by making a commit and pushing to `main` branch

---

## Troubleshooting

**"I can't see my secret access key"**
- If you already created the access key but didn't save it, you need to create a new one
- Go to IAM → Users → Your user → Security credentials → Create access key

**"I don't have permission to create IAM users"**
- You need AWS admin access or someone with admin access to create the user for you
- The IAM user only needs ECR permissions (the policy above)

**"The secrets page shows an error"**
- Make sure you're logged into GitHub
- Make sure you have admin access to the repository
- Try refreshing the page
