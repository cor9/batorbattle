# Quick Checklist: Your Action Items

## ✅ Pre-Flight Check
- [ ] You have AWS Console access
- [ ] You have GitHub repository access
- [ ] You know your AWS region (e.g., `us-east-1`)

---

## Step 1: Create ECR Repository (5 min)
**Where:** AWS Console → ECR

- [ ] Go to https://console.aws.amazon.com/ecr
- [ ] Click "Create repository"
- [ ] Name: `bator-battle-backend`
- [ ] Enable "Scan on push"
- [ ] Click "Create"
- [ ] ✅ **Done:** Repository created

---

## Step 2: Create IAM User (5 min)
**Where:** AWS Console → IAM

- [ ] Go to https://console.aws.amazon.com/iam → Users
- [ ] Click "Create user"
- [ ] Name: `github-actions-ecr`
- [ ] Access type: "Programmatic access"
- [ ] Create policy (JSON tab) with ECR permissions (see YOUR_STEPS.md)
- [ ] Attach policy to user
- [ ] **SAVE:** Access Key ID and Secret Access Key
- [ ] ✅ **Done:** Credentials saved

---

## Step 3: Add GitHub Secrets (2 min)
**Where:** GitHub → Your Repo → Settings → Secrets

- [ ] Go to `https://github.com/YOUR_USERNAME/batorbattle/settings/secrets/actions`
- [ ] Click "New repository secret"
- [ ] Name: `AWS_ACCESS_KEY_ID`, Value: (from Step 2)
- [ ] Click "New repository secret" again
- [ ] Name: `AWS_SECRET_ACCESS_KEY`, Value: (from Step 2)
- [ ] ✅ **Done:** Secrets added

---

## Step 4: Update Workflow File (2 min)
**Where:** GitHub → `.github/workflows/deploy-to-ecr.yml`

- [ ] Open the file in GitHub
- [ ] Click edit (pencil icon)
- [ ] Update `AWS_REGION` to your region
- [ ] Update `ECR_REPOSITORY` if different
- [ ] Update `APP_RUNNER_SERVICE` to your service name
- [ ] Commit changes
- [ ] ✅ **Done:** Workflow configured

---

## Step 5: Create/Update App Runner (5 min)
**Where:** AWS Console → App Runner

**If NEW service:**
- [ ] Go to https://console.aws.amazon.com/apprunner
- [ ] Click "Create service"
- [ ] Source: **"Container registry"** (NOT source code)
- [ ] Provider: Amazon ECR
- [ ] Repository: `bator-battle-backend`
- [ ] Tag: `latest`
- [ ] Deployment trigger: **"Automatic"** ✅
- [ ] Port: `8181`
- [ ] Add environment variables (see YOUR_STEPS.md)
- [ ] Create service
- [ ] ✅ **Done:** Service created

**If EXISTING service:**
- [ ] Open your App Runner service
- [ ] Click "Edit"
- [ ] Change source to "Container registry"
- [ ] Select ECR repository
- [ ] Enable "Automatic" deployment
- [ ] Save
- [ ] ✅ **Done:** Service updated

---

## Step 6: Test (3 min)
**Where:** GitHub → Push code

- [ ] Make a small change (add comment to any file)
- [ ] Commit and push:
  ```bash
  git add .
  git commit -m "Test deployment"
  git push origin main
  ```
- [ ] Watch GitHub Actions tab (should run ~2-3 min)
- [ ] Check ECR repository (should see new image)
- [ ] Check App Runner (should auto-deploy ~2-5 min)
- [ ] ✅ **Done:** Everything working!

---

## 🎉 Success!
Your deployments should now be **2-5 minutes** instead of 10-15 minutes!

---

## ⚠️ Common Issues

**GitHub Actions fails:**
- Check secrets are correct
- Check IAM user has ECR permissions

**App Runner doesn't deploy:**
- Check "Automatic" is enabled
- Manually trigger deployment once

**Need more details?** See `YOUR_STEPS.md` for full instructions.

